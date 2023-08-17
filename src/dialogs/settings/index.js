// A component showing a modal dialog where a story's JavaSCript.

const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { isValidUrl } = require("../../utils/common");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		assetBaseUrl: '',
		storyUrl: '',
	}),

	ready() {
		const data = this.settingsData;
		if (data) {
			this.assetBaseUrl = data.assetBaseUrl || '';
			this.storyUrl = data.storyUrl || '';
		}
	},

	computed: {
		settingsData() {
			const { settings } = this.allStories.find((story) => story.id === this.storyId) || {};
			return settings;
		},
		isValid() {
			return this.isValidUrl(this.storyUrl) && this.isValidBaseUrl(this.assetBaseUrl);
		},
	},

	methods: {
		isValidUrl(url) {
			return !url || isValidUrl(url);
		},
		isValidBaseUrl(url) {
			return this.isValidUrl(url) && (!url || /\/$/.test(url)); 
		},
		save() {
			const settings = { 
				...this.settingsData,
				storyUrl: this.storyUrl,
				assetBaseUrl: this.assetBaseUrl,
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
