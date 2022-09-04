// A component showing a modal dialog where a story's JavaSCript.

const { trim } = require("lodash");
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
		matomoHostToEnv: [],
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
		this.matomoHostToEnv = Object.entries(this.matomo.browserHostToEnvironmentMap || {});
		if (!this.matomoHostToEnv.length) {
			this.add(this.matomoHostToEnv);
		}
	},

	computed: {
		isValidMatomoPHPUrl() {
			return this.matomo.url && isValidUrl(this.matomo.url);
		},
		
		isValid() {
			const matomo = !this.matomo.enabled || (!!this.matomo.url && isValidUrl(this.matomo.url) && !!this.matomo.siteId && this.isValidMatomoHostToEnv());
			const chat = !this.chat.enabled || (this.chat.appId && this.chat.authKey && this.chat.authSecret && this.chat.accountKey);
			return matomo && chat; 
		},
	},

	methods: {

		add(arr, index, event) {
			arr.push(['', '']);
		},

		remove(arr, index, event) {
			arr.splice(index, 1);
		},

		isValidMatomoHostToEnvEntry(entry) {
			const key = trim(entry[0]);
			const value = trim(entry[1]);
			return !!((key && value) || (!key && !value));
		},

		isValidMatomoHostToEnv() {
			return !this.matomoHostToEnv.some((entry) => !this.isValidMatomoHostToEnvEntry(entry));
		},

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
					if (plugin === 'matomo') {
						plugins.matomo.browserHostToEnvironmentMap = {};
						this.matomoHostToEnv
						.map(([key, value]) => ([trim(key), trim(value)]))
						.filter(([key, value]) => !!key && !!value)
						.forEach(([key, value]) => {
							plugins.matomo.browserHostToEnvironmentMap[key] = value;
						});
					}
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
