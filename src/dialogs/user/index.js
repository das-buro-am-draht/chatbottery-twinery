// A component showing a modal dialog where a story's JavaSCript.

const { trim } = require("lodash");
const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		userData: [],
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
							tv.value = Boolean(v.value);
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
		isValidMatomoPHPUrl() {
			return this.matomo.url && isValidUrl(this.matomo.url);
		},
		
		isValid() {
			return this.isValidUserData(); 
		},
	},

	methods: {

		add(arr, index, event) {
			arr.push(['', { type: 'string', value: '' }]);
		},

		remove(arr, index, event) {
			arr.splice(index, 1);
		},

		isUserEntrySet(entry) {
			const key = trim(entry[0]);
			const tv = entry[1];
			return key || (!key && !tv.value);
		},

		isValidUserEntry(entry) {
			const key = trim(entry[0]);
			return !key || !key.startsWith('$');
		},

		isValidUserData() {
			return !this.userData.some((entry) => !this.isUserEntrySet(entry) || !this.isValidUserEntry(entry));
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
						tv.value = Boolean(tv.value);
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
		},

		getters: {
			allStories: (state) => state.story.stories,
		},
	},

	components: {
		"modal-dialog": require("../../ui/modal-dialog"),
	},
});
