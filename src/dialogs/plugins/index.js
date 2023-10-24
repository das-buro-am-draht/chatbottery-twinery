// A component showing a modal dialog where a story's JavaSCript.

const { trim } = require("lodash");
const Vue = require("vue");
const { updateStory } = require("../../data/actions/story");
const { isValidUrl } = require("../../utils/common");
const locale = require("../../locale");
const { confirm } = require('../confirm');

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
			authToken: '',
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
			userName: '',
			userVariables: [],
		},
		matomoHostToEnv: [],
		userData: {},
		modified: false,
	}),

	ready() {
		const { plugins: data, userData } = this.story;
		if (userData) {
			this.userData = Object.entries(userData || {})
				.filter(([k, v]) => v.type !== 'function')
				.map(([k]) => k.substring(1));
		}
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
		if (!this.chat.userVariables.length) {
			this.addUserVariable(this.chat.userVariables);
		}
		this.$watch('matomo', () => this.modified = true, { deep: true });
		this.$watch('google', () => this.modified = true, { deep: true });
		this.$watch('chat', () => this.modified = true, { deep: true });
		this.$watch('matomoHostToEnv', () => this.modified = true, { deep: true });
	},

	computed: {

		story() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

		isValidMatomoPHPUrl() {
			return this.matomo.url && isValidUrl(this.matomo.url);
		},

		isValidMatomoHostToEnv() {
			return !this.matomoHostToEnv.some((entry) => !this.isValidMatomoHostToEnvEntry(entry));
		},

		isValidUserVariables() {
			return !this.chat.userVariables.some((entry) => !this.isValidUserName(entry));
		},
		
		isValid() {
			const matomo = !this.matomo.enabled || (this.isValidMatomoPHPUrl && !!this.matomo.siteId && this.isValidMatomoHostToEnv && this.isValidUserVariables);
			const chat = !this.chat.enabled || (this.chat.credentials.appId && this.chat.credentials.authKey && this.chat.credentials.authSecret && this.chat.credentials.accountKey && this.isValidUserName(this.chat.userName));
			return matomo && chat; 
		},
	},

	methods: {

		add(arr, index, event) {
			arr.push(['', '']);
		},

		addUserVariable(arr, index, event) {
			arr.push('');
		},

		remove(arr, index, event) {
			arr.splice(index, 1);
		},

		isValidMatomoHostToEnvEntry(entry) {
			const key = trim(entry[0]);
			const value = trim(entry[1]);
			return (key && value) || (!key && !value);
		},

		isValidUserName(userName) {
			return !userName || !userName.startsWith('$');
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
			this.modified = false;
			this.$refs.modal.close();
		},

		canClose() {
			if (!this.modified) {
				return true;
			}
			confirm({
				message: locale.say('There were changes detected for the plugins data dialog. Are you sure you want to discard those changes?'),
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
