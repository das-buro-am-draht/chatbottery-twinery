// A component showing a modal dialog where a story's JavaSCript.

const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { isValidUrl } = require("../../utils/common");
const locale = require("../../locale");
const { confirm } = require('../confirm');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		assetBaseUrl: '',
		storyUrl: '',
		searchUrl: '',
		modified: false,
	}),

	ready() {
		const data = this.settingsData;
		if (data) {
			this.assetBaseUrl = data.assetBaseUrl || '';
			this.storyUrl = data.storyUrl || '';
			this.searchUrl = data.searchUrl || '';
		}
		this.$watch('assetBaseUrl', () => this.modified = true);
		this.$watch('storyUrl', () => this.modified = true);
		this.$watch('searchUrl', () => this.modified = true);
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
				searchUrl: this.searchUrl,
				assetBaseUrl: this.assetBaseUrl,
			};
			this.updateStory(this.storyId, { settings });
			this.modified = false;
			this.$refs.modal.close();
		},

		canClose() {
			if (!this.modified) {
				return true;
			}
			confirm({
				message: locale.say('There were changes detected for the settings dialog. Are you sure you want to discard those changes?'),
				buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Discard changes'),
				buttonClass: 'danger'
			}).then(() => {
				this.$refs.modal.$emit('close');
			});
			return false;
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
