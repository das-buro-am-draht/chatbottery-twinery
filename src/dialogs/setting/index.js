// A component showing a modal dialog where a story's JavaSCript.

const { trim } = require("lodash");
const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { isValidUrl } = require("../../utils/common");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		storyUrl: '',
	}),

	ready() {
		const data = this.getSettingsData();
		if (data) {
			this.storyUrl = data.storyUrl || '';
		}
	},

	computed: {
		
		isValid() {
			return !this.storyUrl || /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(this.storyUrl);
		},
	},

	methods: {

		getStory() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

		getSettingsData() {
			const { settings } = this.getStory() || {};
			return settings;
		},

		save() {
			const settings = { 
				...this.getSettingsData(),
				storyUrl: this.storyUrl,
			};
			this.updateStory(this.storyId, { settings });
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
