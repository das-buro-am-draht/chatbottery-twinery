// A component showing a modal dialog where a story's JavaSCript.

import trim from "lodash/trim";
import Vue from "vue";
import { regularExpression } from "../../utils/common";
import locale from "../../locale";
import notify from "../../ui/notify";
import PassageEditor from '../../editors/passage';
import SearchDropdown from './search';
import ModalDialog from "../../ui/modal-dialog";

import "./index.less";
import template from "./index.html";

const labelStoreInLocalStorage = '$storeUserDataInLocalStorage';

const UserDataDialog = Vue.extend({
	template,

	searchDropdown: null,
		
	data: () => ({
		storyId: null,
		userData: [],
		storeInLocalStorage: false
	}),

	mounted: function () {
		this.$nextTick(function () {
			const data = this.getUserData();
			if (data) {
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
		});
	},

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
		createNewlyLinkedPassages () { return this.$store._actions.createNewlyLinkedPassages[0] },
		allStories () { return this.$store.getters.allStories },

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

		editPassage(passage) {
			const story = this.getStory();
			const oldText = passage.text;
			const afterEdit = () => {
				this.createNewlyLinkedPassages({
					storyId: story.id,
					passageId: passage.id,
					oldText,
					gridSize: this.gridSize
				});
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
					this.editPassage(passages[0]);
				} else {
					const rect = event.target.getBoundingClientRect();
					setTimeout(() => {
						Promise.resolve(new SearchDropdown({
							parent: this,
							data: {
								origin: event.target,
								passages,
								x: rect.x + rect.width,
								y: rect.y,
							},
							store: this.$store,
						})
						.$mountTo(this.$refs.modal.$el))
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

			this.updateStory({storyId: this.storyId, userData: data });
			this.$refs.modal.close();
		},

	},

	events: {
		'passage-edit'(passage) {
			this.editPassage(passage);
		}
	},

	components: {
		"modal-dialog": ModalDialog,
	}

});

export default UserDataDialog;
