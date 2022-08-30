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
			phpUrl: '',
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
			credentials: {
				appId: '',
				authKey: '',
				authSecret: '',
				accountKey: '',
			},
			endpoints: {
				api: '',
				chat: '',
			}
		}
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
			return this.matomo.phpUrl && isValidUrl(this.matomo.phpUrl);
		},
		isValid() {
			const google = true;
			const matomo = this.matomo.phpUrl && isValidUrl(this.matomo.phpUrl) && !!this.matomo.siteId;
			const chat = this.chat.credentials.appId && this.chat.credentials.authKey && this.chat.credentials.authSecret && this.chat.credentials.accountKey && this.chat.endpoints.api && this.chat.endpoints.chat;
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
