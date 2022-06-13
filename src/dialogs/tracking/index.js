// A component showing a modal dialog where a story's JavaSCript.

const Vue = require("vue");
const JavaScriptEditor = require('../../editors/javascript');
const { updateStory } = require("../../data/actions/story");
const isTrackingScript = require("../../utils/isTrackingScript");

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
		statiscticalArea: "",
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

			if (isScriptCodeReady && (this.google || this.matomo)) {
				const tracking = {
					matomo: this.matomo,
					google: this.google,
					matomoJSUrl: this.matomoJSUrl,
					googleAnalyticsJSUrl: this.googleAnalyticsJSUrl,
					matomoPHPUrl: this.matomoPHPUrl,
					siteId: this.siteId,
					statiscticalArea: this.statiscticalArea,
					browserHostToEnvironmentMap: this.browserHostToEnvironmentMap,
					shouldStoreTrackingIdInCookies: this.shouldStoreTrackingIdInCookies,
				};

				this.updateStory(this.storyId, { tracking });
			}
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
