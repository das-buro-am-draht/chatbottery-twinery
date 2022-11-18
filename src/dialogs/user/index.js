// A component showing a modal dialog where a story's JavaSCript.

const { trim } = require("lodash");
const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { regularExpression } = require("../../utils/common");
const locale = require("../../locale");
const notify = require("../../ui/notify");
const PassageEditor = require('../../editors/passage');
const SearchDropdown = require('./search');
const { createNewlyLinkedPassages } = require('../../data/actions/passage');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		userData: [],
		searchDropdown: null,
	}),

	ready() {
		const data = this.getUserData();
		if (data) {
			this.userData = Object.entries(data).map(([k, v]) => {
				const tv = {
					type: 'string',
					value: null,
				};
				if (typeof v === 'string') {
					tv.value = v;
				} else if (typeof v === 'object' && v.type) {
					tv.type = v.type;
					switch (v.type) {
						default:
							tv.type = 'string';
							tv.value = String(v.value);
							break;
						case 'boolean':
							tv.value = v.value == null ? null : Boolean(v.value) ? 'true' : 'false';
							break;
						case 'number':
							tv.value = v.value == null ? null : Number(v.value);
							break;
						case 'date':
							if (v.value) {
								const date = new Date(v.value);
								tv.value = date.getFullYear() + '-' 
									+ ('0' + (date.getMonth() + 1)).slice(-2) + '-'
									+ ('0' + (date.getDate()     )).slice(-2);
							} else {
								tv.value = null;	
							}
							break;
					}
				} else {
					console.error(`Illegal user data entry '${k}.`);
				}
				return ([k.substring(1), tv]);
			});
		}
		if (!this.userData.length) {
			// ensure one empty entry
			this.add(this.userData);
		}

	},

	computed: {
		isValid() {
			return !this.userData.some((entry) => !this.isUserEntrySet(entry) || !this.isValidUserEntry(entry));
		},
		gridSize() {
			return 25;
		},
	},

	methods: {

		onDialogClicked(e) {
			if (this.searchDropdown && !this.searchDropdown.$el.contains(e.target)) {
				this.closeSearchDropdown();
			}
		},

		add(arr) {
			arr.push(['', { type: 'string', value: '' }]);
		},

		remove(arr, index) {
			arr.splice(index, 1);
		},

		closeSearchDropdown() {
			if (this.searchDropdown) {
				this.searchDropdown.$destroy(true);
				this.searchDropdown = null;
			}
		},

		search(entry, event) {
			if (this.searchDropdown) {
				if (this.searchDropdown.origin === event.target) {
					this.closeSearchDropdown();
					return;
				}
			}

			this.closeSearchDropdown();

			const story = this.getStory();
			const key = '$' + trim(entry[0]);
			const regex = regularExpression(key);
			const passages = story.passages.filter((passage) => regex.test(passage.text));		
			if (!passages.length) {
				notify(
					locale.say(
						"&ldquo;%1$s&rdquo; was not found", 
						key
					), 'info'
				);
			} else {
				if (passages.length === 1) {
					const passage = passages[0];
					const oldText = passage.text;
					const afterEdit = () => {
						this.createNewlyLinkedPassages(
							story.id,
							passage.id,
							oldText,
							this.gridSize
						);
					};
					new PassageEditor({
						data: {
							passageId: passage.id,
							storyId: story.id,
							origin: event.target,
						},
						store: this.$store,
						storyFormat: {
							name: story.storyFormat,
							version: story.storyFormatVersion
						}
					})
					.$mountTo(document.body)
					.then(afterEdit)
					.catch(afterEdit);
				} else {
					setTimeout(() => {
						Promise.resolve(new SearchDropdown({
							parent: this,
							data: {
								storyId: story.id,
								origin: event.target,
								passages,
								gridSize: this.gridSize,
							},
							store: this.$store,
						})
						.$mountTo(event.target.parentNode))
						.then(dropdown => this.searchDropdown = dropdown);
					}, 0);
				}
			}
		},

		isUserEntrySet(entry) {
			const key = trim(entry[0]);
			const tv = entry[1];
			return key || (!key && !tv.value);
		},

		isEmptyUserEntry(entry) {
			const key = trim(entry[0]);
			return !key;
		},

		isValidUserEntry(entry) {
			const key = trim(entry[0]);
			return !key || !key.startsWith('$');
		},

		getStory() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

		getUserData() {
			return this.getStory().userData || {};
		},

		save() {
			const data = this.userData.reduce((userData, data) => {
				const [key, tv] = data;
				switch (tv.type) {
					case 'number':
						tv.value = tv.value ? Number(tv.value) : null;
						break;
					case 'boolean':
						tv.value = tv.value ? tv.value === 'true' : null;
						break;
					case 'date':
						tv.value = tv.value ? new Date(tv.value).valueOf() : null;
						break;
				}
				userData['$' + trim(key)] = tv;
				return userData;
			}, {});

			this.updateStory(this.storyId, { userData: data });
			this.$refs.modal.close();
		},

	},

	vuex: {
		actions: {
			updateStory,
			createNewlyLinkedPassages,
		},

		getters: {
			allStories: (state) => state.story.stories,
		},
	},

	components: {
		"modal-dialog": require("../../ui/modal-dialog"),
	},

});
