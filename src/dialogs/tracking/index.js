// A component showing a modal dialog where a story's JavaSCript.

const Vue = require("vue");
const JavaScriptEditor = require('../../editors/javascript');
const { updateStory } = require("../../data/actions/story");
const { isTrackingScript } = require("../../utils/tracking");
const { isValidUrl } = require("../../utils/common");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		matomo: false,
		google: false,
		matomoJSUrl: "",
		googleAnalyticsJSUrl: "",
		matomoPHPUrl: "",
		siteId: "",
		statisticalArea: "",
		browserHostToEnvironmentMap: {},
		shouldStoreTrackingIdInCookies: false,
		storyId: "",
	}),

	ready() {
		const tracking = this.getTrackingData();
		const trackingEntries = tracking && Object.entries(tracking) || [];
		const isTracking = trackingEntries.length > 0;

		if (isTracking) {
			trackingEntries.forEach(([key, entry]) => this[key] = entry);
		}
	},

	computed: {
		isTrackingPossible() {
			return this.isScriptCodeReady();
		},
		isValidMatomoJSUrl() {
			return this.matomoJSUrl && isValidUrl(this.matomoJSUrl);
		},
		isValidMatomoPHPUrl() {
			return this.matomoPHPUrl && isValidUrl(this.matomoPHPUrl);
		},
		isValidGoogleAnalyticsJSUrl() {
			return this.googleAnalyticsJSUrl && isValidUrl(this.googleAnalyticsJSUrl);
		},
		isValid() {
			return (!this.matomo || (this.matomoJSUrl && isValidUrl(this.matomoJSUrl) && this.matomoPHPUrl && isValidUrl(this.matomoPHPUrl) && !!this.siteId))
				  && (!this.google || (this.googleAnalyticsJSUrl && isValidUrl(this.googleAnalyticsJSUrl))) 
		}
	},

	methods: {
		getStory() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

		getTrackingData() {
			const { tracking } = this.getStory() || {};

			return tracking;
		},

		getScriptCode() {
			const { script } = this.getStory();

			return script;
		},

		isScriptCodeReady() {
			const script = this.getScriptCode();

			return isTrackingScript(script);
		},

		save() {
			const isScriptCodeReady = this.isScriptCodeReady();

			const tracking = (isScriptCodeReady && (this.google || this.matomo)) ? {
				matomo: this.matomo,
				google: this.google,
				matomoJSUrl: this.matomoJSUrl,
				googleAnalyticsJSUrl: this.googleAnalyticsJSUrl,
				matomoPHPUrl: this.matomoPHPUrl,
				siteId: this.siteId,
				statisticalArea: this.statisticalArea,
				browserHostToEnvironmentMap: this.browserHostToEnvironmentMap,
				shouldStoreTrackingIdInCookies: this.shouldStoreTrackingIdInCookies,
			} : undefined;

			this.updateStory(this.storyId, { tracking });
			this.$refs.modal.close();
		},

		editScript(e) {
			/*
			We have to manually inject the Vuex store, since the editors are
			mounted outside the app scope.
			*/

			new JavaScriptEditor({
				data: {storyId: this.storyId, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
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
