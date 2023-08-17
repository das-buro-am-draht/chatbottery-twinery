/*
A modal dialog for editing a single passage.
*/

const Vue = require('vue');
const CodeMirror = require('codemirror');
const locale = require('../../locale');
const { parse, stringify } = require('../../utils/xmlparser');
const { thenable } = require('../../vue/mixins/thenable');
const { updateStory } = require("../../data/actions/story");
const { changeLinksInStory, updatePassage } = require('../../data/actions/passage');
const parseVariables = require('../../data/variables-parser');
const { loadFormat } = require('../../data/actions/story-format');
const { passageDefaults } = require('../../data/store/story');
const SettingsDialog = require('./settings');
const notify = require('../../ui/notify');

require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror/prefix-trigger');

require('./index.less');

/*
Expose CodeMirror to story formats, currently for Harlowe compatibility.
*/

window.CodeMirror = CodeMirror;

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null,
		gui: null,
	}),

	ready() {
		if (process.env.NODE_ENV === 'development') {
			this.toggleMode();
		}
		
		this.userPassageName = this.passage.name;

		/* Update the window title. */

		this.oldWindowTitle = document.title;
		document.title = locale.say('Editing \u201c%s\u201d', this.passage.name);

		/*
		Load the story's format and see if it offers a CodeMirror mode.
		*/

		if (this.$options.storyFormat) {
			this.loadFormat(
				this.$options.storyFormat.name,
				this.$options.storyFormat.version
			).then(format => {
				let modeName = format.name.toLowerCase();

				/* TODO: Resolve this special case with PR #118 */

				if (modeName === 'harlowe') {
					modeName += `-${/^\d+/.exec(format.version)}`;
				}

				if (modeName in CodeMirror.modes) {
					/*
					This is a small hack to allow modes such as Harlowe to
					access the full text of the textarea, permitting its lexer
					to grow a syntax tree by itself.
					*/

					CodeMirror.modes[modeName].cm = this.$refs.codemirror.$cm;

					/*
					Now that's done, we can assign the mode and trigger a
					re-render.
					*/

					this.$refs.codemirror.$cm.setOption('mode', modeName);
				}
			});
		}

		/*
		Set the mode to the default, 'text'. The above promise will reset it if
		it fulfils.
		*/

		this.$refs.codemirror.$cm.setOption('mode', 'text');

		/*
		Either move the cursor to the end or select the existing text, depending
		on whether this passage has only default text in it.
		*/

		if (this.passage.text === passageDefaults.text) {
			this.$refs.codemirror.$cm.execCommand('selectAll');
		}
		else {
			this.$refs.codemirror.$cm.execCommand('goDocEnd');
		}
	},

	beforeDestroy() {
		if (!this.$refs.codemirror.$cm.isClean()) {
			const userData = this.story.userData;
			const xml = this.$refs.codemirror.$cm.getValue();
			const variables = parseVariables(xml);
			const newData = Object.entries(variables)
				.filter(([k]) => !userData[k])
				.reduce((obj, [k, v]) => {
					obj[k] = v;
					return obj;
				}, {});
			const keys = Object.keys(newData);
			if (keys.length > 0) {
				notify(
					locale.say(
						'New user variables were found: &ldquo;%1$s&rdquo;',
						keys.join(', ')
					)
				);
				// 'UserDataDialog' must not be global due to circular dependencies
				const UserDataDialog = require('../../dialogs/user');
				new UserDataDialog({
					data: { 
						storyId: this.storyId, 
						newData,
						origin: this.origin,
					},
					store: this.$store,
				}).$mountTo(document.body);
				// this.updateStory(this.storyId, { userData: { ...userData, ...newData } }); 
			}
		}
	},

	destroyed() {
		document.title = this.oldWindowTitle;
	},

	computed: {
		cmOptions() {
			return {
				placeholder: locale.say(
					'Enter the body text of your passage here.' /* To link to another ' +
					'passage, put two square brackets around its name, [[like ' +
					'this]].' */
				),
				prefixTrigger: {
					prefixes: ['[[', '->'],
					callback: this.autocomplete.bind(this)
				},
				extraKeys: {
					'Ctrl-Space': this.autocomplete.bind(this)
				},
				indentWithTabs: true,
				lineWrapping: true,
				lineNumbers: false,
				mode: 'text'
			};
		},

		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		passage() {
			return this.story.passages.find(
				passage => passage.id === this.passageId
			);
		},

		userPassageNameValid() {
			return !(this.story.passages.some(
				passage => passage.name === this.userPassageName &&
					passage.id !== this.passage.id
			));
		},

		autocompletions() {
			return this.story.passages.map(passage => passage.name);
		}
	},

	methods: {
		autocomplete() {
			this.$refs.codemirror.$cm.showHint({
				hint: cm => {
					const wordRange = cm.findWordAt(cm.getCursor());
					const word = cm.getRange(
						wordRange.anchor,
						wordRange.head
					).toLowerCase();

					const comps = {
						list: this.autocompletions.filter(
							name => name.toLowerCase().indexOf(word) !== -1
						),
						from: wordRange.anchor,
						to: wordRange.head
					};

					CodeMirror.on(comps, 'pick', () => {
						const doc = cm.getDoc();

						doc.replaceRange(']] ', doc.getCursor());
					});

					return comps;
				},

				completeSingle: false,

				extraKeys: {
					']'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange(']', doc.getCursor());
						hint.close();
					},

					'-'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('-', doc.getCursor());
						hint.close();
					},

					'|'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('|', doc.getCursor());
						hint.close();
					}
				}
			});
		},

		saveText(text) {
			this.updatePassage(
				this.story.id,
				this.passage.id,
				{ text: text }
			);
		},

		saveTags(tags) {
			this.updatePassage(
				this.story.id,
				this.passage.id,
				{ tags: tags }
			);
		},

		dialogDestroyed() {
			this.$destroy();
		},

		canClose() {
			if (!this.userPassageNameValid) {
				return false;
			}
			if (this.userPassageName !== this.passage.name) {
				this.changeLinksInStory(
					this.story.id,
					this.passage.name,
					this.userPassageName
				);

				this.updatePassage(
					this.story.id,
					this.passage.id,
					{ name: this.userPassageName }
				);
			}

			return true;
		},

		toggleMode() {
			if (this.gui) {
				this.gui = null;
				Vue.nextTick(() => this.$refs.codemirror.$cm.refresh());
			} else {
				try {
					this.gui = parse(this.passage.text);
				} catch (e) {
					notify(e.message, 'danger');
				}
			}
		},

		properties() {
			new SettingsDialog({
				data: {
					storyId: this.storyId,
					passage: this.passage,
					origin: null, // this.$refs.modal.$el,
				},
				store: this.$store,
			}).$mountTo(document.body); // this.$refs.modal.$el);
		},

		serialize() {
			const xml = stringify(this.gui);
			this.$refs.codemirror.$cm.setValue(xml);
			this.$refs.codemirror.$el.dispatchEvent(new Event('change'));
		},
	},

	events: {
		'gui-changed'() {
			this.serialize();
		},
	},

	components: {
		'code-mirror': require('../../vue/codemirror'),
		'modal-dialog': require('../../ui/modal-dialog'),
		'tag-editor': require('./tag-editor'),
		'ui-view': require('./ui-view'),
		'ui-menu': require('./ui-view/menu'),
	},

	vuex: {
		actions: {
			changeLinksInStory,
			updatePassage,
			updateStory,
			loadFormat,
		},

		getters: {
			allStories: state => state.story.stories,
		},
	},

	mixins: [thenable]
});
