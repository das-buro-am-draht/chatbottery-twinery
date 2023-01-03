// A component showing a modal dialog where a story's JavaSCript.

import trim from "lodash/trim";
import Vue from "vue";
import { isValidUrl } from "../../utils/common";
import ModalDialog from "../../ui/modal-dialog";

import "./index.less";
import template from "./index.html";

const plugins = ['matomo', 'google', 'chat'];

const PluginDialog = Vue.extend({
	template,

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
	}),

	mounted: function () {
		this.$nextTick(function () {
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
			if (!this.chat.userVariables.length) {
				this.addUserVariable(this.chat.userVariables);
			}
		});
	},

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
		allStories () { return this.$store.getters.allStories },

		isValidMatomoPHPUrl() {
			return this.matomo.url && isValidUrl(this.matomo.url);
		},
		
		isValid() {
			const matomo = !this.matomo.enabled || (!!this.matomo.url && isValidUrl(this.matomo.url) && !!this.matomo.siteId && this.isValidMatomoHostToEnv() && this.isValidUserVariables());
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

		isValidMatomoHostToEnv() {
			return !this.matomoHostToEnv.some((entry) => !this.isValidMatomoHostToEnvEntry(entry));
		},

		isValidUserName(userName) {
			return !userName || !userName.startsWith('$');
		},

		isValidUserVariables() {
			return !this.chat.userVariables.some((entry) => !this.isValidUserName(entry));
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

			this.updateStory({storyId: this.storyId, plugins: data });
			this.$refs.modal.close();
		},
	},

	components: {
		"modal-dialog": ModalDialog,
	},
});

export default PluginDialog;
