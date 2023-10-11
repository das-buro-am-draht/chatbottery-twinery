// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const { updateStory } = require("../../data/actions/story");
const { 
	trim, 
	stringFromDate, 
	regularExpression 
} = require("../../utils/common");
const locale = require("../../locale");
const notify = require("../../ui/notify");
const { confirm } = require('../../dialogs/confirm');
const PassageEditor = require("../../editors/passage");
const SearchDropdown = require('./search');
const { createNewlyLinkedPassages } = require('../../data/actions/passage');

require("./index.less");

const labelStoreInLocalStorage = '$storeUserDataInLocalStorage';

module.exports = Vue.extend({
	template: require("./index.html"),

	searchDropdown: null,
		
	data: () => ({
		storyId: null,
		origin: null,
		userData: [],
		newData: {},
		storeInLocalStorage: false,
		modified: false,
	}),

	ready() {
		const data = this.story.userData || {};
		this.userData = Object.entries(data)
			.filter(([k, v]) => {
				if (k === labelStoreInLocalStorage) {
					this.storeInLocalStorage = !!v;
					return false;
				}
				return true;
			})
			.map(([k, v]) => {
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
								tv.value = stringFromDate(new Date(v.value));
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

		if (Object.keys(this.newData).length > 0) {
			this.modified = true;
			this.userData = this.userData.concat(Object.entries(this.newData)
				.filter(([k]) => k.startsWith('$'))
				.map(([k,v]) => [k.substring(1), v]));
		}

		if (!this.userData.length) {
			// ensure one empty entry
			this.add();
		}

		this.$watch('userData', () => this.modified = true, { deep: true });
	},

	computed: {
		isValid() {
			return !this.userData.some((entry) => !this.isUserEntrySet(entry) || !this.isValidUserEntry(entry));
		},
		gridSize() {
			return 25;
		},
		story() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},
	},

	methods: {

		drag(index, event) {
			event.dataTransfer.setData('cb/user-data', index);
		},
		dragenter(event) {
			if (event.dataTransfer && event.dataTransfer.types.includes('cb/user-data')) {
				event.preventDefault(); // is allowed
			}
		},
		drop(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData('cb/user-data'), 10);
			// event.dataTransfer.clearData('cb/user-data'); // in Firefox 'clearData' cannot be used here
			if (toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.userData.length) {
				const userData = [ ...this.userData ];
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				userData.splice(insertIdx, 0, userData[fromIdx]);
				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				userData.splice(removeIdx, 1);
				this.userData.splice(0, this.userData.length, ...userData);
				this.modified = true;
			}
		},

		onDialogClicked(e) {
			if (this.searchDropdown && !this.searchDropdown.$el.contains(e.target)) {
				this.closeSearchDropdown();
			}
		},

		add() {
			this.userData.push(['', { type: 'string', value: '' }]);
		},

		remove(index) {
			this.userData.splice(index, 1);
			this.modified = true;
		},

		closeSearchDropdown() {
			if (this.searchDropdown) {
				this.searchDropdown.$destroy(true);
				this.searchDropdown = null;
			}
		},

		editPassage(passage) {
			const story = this.story;
			const oldText = passage.text;
			const afterEdit = () => {
				if (this.$refs.modal && this.$refs.modal.$els.dlg) {
					this.$refs.modal.$els.dlg.focus();
				}
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
		},

		search(entry, event) {
			if (this.searchDropdown && this.searchDropdown.origin === event.target) {
				this.closeSearchDropdown();
				return;
			}

			this.closeSearchDropdown();

			const key = '$' + trim(entry[0]);
			const regex = regularExpression(key);
			const passages = this.story.passages.filter((passage) => regex.test(passage.text));		
			if (!passages.length) {
				notify(
					locale.say(
						"&ldquo;%1$s&rdquo; was not found", 
						key
					), 'info'
				);
			} else {
				if (passages.length === 1) {
					this.editPassage(passages[0]);
				} else {
					const rect = event.target.getBoundingClientRect();
					this.searchDropdown = new SearchDropdown({
						parent: this,
						data: {
							origin: event.target,
							passages,
							x: rect.x + rect.width,
							y: rect.y,
						},
						store: this.$store,
					})
					.$mountTo(this.$refs.modal.$el);
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

		save() {
			const data = this.userData.filter(([key]) => !!trim(key)).reduce((userData, data) => {
				const [key, tv] = data;
				switch (tv.type) {
					case 'number':
						tv.value = tv.value !== '' ? Number(tv.value) : null;
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

			if (this.storeInLocalStorage) {
				data[labelStoreInLocalStorage] = true;
			}

			this.updateStory(this.storyId, { userData: data });
			this.modified = false;
			this.$refs.modal.close();
		},

		canClose() {
			if (!this.modified) {
				return true;
			}
			confirm({
				message: locale.say('There were changes detected for the user data dialog. Are you sure you want to discard those changes?'),
				buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Discard changes'),
				buttonClass: 'danger'
			}).then(() => {
				this.$refs.modal.$emit('close');
			});
			return false;
		},

	},

	events: {
		'passage-edit'(passage) {
			this.editPassage(passage);
		}
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
