// A component showing a modal dialog where a story's JavaSCript.

const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { isValidUrl } = require("../../utils/common");

require("./index.less");

const plugins = ['matomo', 'google', 'chat'];

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		matomo: {
			enabled: false,
			url: '',
			siteId: '',
			statisticalArea: '',
			shouldStoreTrackingIdInCookies: false,
			browserHostToEnvironmentMap: {},
		},
		google: {
			enabled: false,
		},
		chat: {
			enabled: false,
			appId: '',
			authKey: '',
			authSecret: '',
			accountKey: '',
		},
	}),

	ready() {
		const data = this.getPluginsData();
		if (data) {
			plugins.forEach((plugin => {
				if (data[plugin]) {
					Object.entries(data[plugin]).forEach(([key, entry]) => this[plugin][key] = entry);
				}
				this[plugin].enabled = !!data[plugin];
			}))
		}
	},

	computed: {
		isValidMatomoPHPUrl() {
			return this.matomo.url && isValidUrl(this.matomo.url);
		},
		isValid() {
			const google = true;
			const matomo = this.matomo.url && isValidUrl(this.matomo.url) && !!this.matomo.siteId;
			const chat = this.chat.appId && this.chat.authKey && this.chat.authSecret && this.chat.accountKey;
			return (
				(!this.matomo.enabled || matomo) &&
				(!this.chat.enabled || chat)); 
		}
	},

	methods: {
		getStory() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

		getPluginsData() {
			const { plugins } = this.getStory() || {};
			return plugins;
		},

		save() {
			const data = plugins.reduce((plugins, plugin) => {
				if (this[plugin].enabled) {
					plugins[plugin] = {
						...this[plugin],
						enabled: undefined,
					};
				}
				return plugins;
			}, {});

			this.updateStory(this.storyId, { plugins: data });
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
