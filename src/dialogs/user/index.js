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
			this.userData = Object.entries(data).map(([key, value]) => ([key.substring(1), value]));
		}
		if (!this.userData.length) {
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
			arr.push(['', '']);
		},

		remove(arr, index, event) {
			arr.splice(index, 1);
		},

		isUserEntrySet(entry) {
			const key = trim(entry[0]);
			const value = entry[1];
			return key || (!key && !value);
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
			const { userData } = this.getStory() || {};
			return userData;
		},

		save() {
			const data = this.userData.reduce((userData, data) => {
				const [key, value] = data;
				userData['$' + trim(key)] = value;
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
