// A component showing a modal dialog where a story's JavaSCript.

import Vue from 'vue';
import { mapActions } from 'vuex';

import JavaScriptEditor from "../../editors/javascript";
import { isTrackingScript } from "../../utils/tracking";
import { isValidUrl } from "../../utils/common";
import ModalDialog from '../../ui/modal-dialog';

import './index.less';
import template from './index.html';

const Tracking = Vue.extend({
	template,

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

	mounted: function () {
		this.$nextTick(function () {
			const tracking = this.getTrackingData();
			const trackingEntries = (tracking && Object.entries(tracking)) || [];
			const isTracking = trackingEntries.length > 0;

			if (isTracking) {
				trackingEntries.forEach(([key, entry]) => (this[key] = entry));
			}
		});
	},

	computed: {
		allStories () { return this.$store.getters.allStories },
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
			return (
				(!this.matomo ||
					(this.matomoJSUrl &&
						isValidUrl(this.matomoJSUrl) &&
						this.matomoPHPUrl &&
						isValidUrl(this.matomoPHPUrl) &&
						!!this.siteId)) &&
				(!this.google ||
					(this.googleAnalyticsJSUrl && isValidUrl(this.googleAnalyticsJSUrl)))
			);
		},
	},

	methods: {
		...mapActions([
			'updateStory'
		]),
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

			const tracking =
				isScriptCodeReady && (this.google || this.matomo)
					? {
							matomo: this.matomo,
							google: this.google,
							matomoJSUrl: this.matomoJSUrl,
							googleAnalyticsJSUrl: this.googleAnalyticsJSUrl,
							matomoPHPUrl: this.matomoPHPUrl,
							siteId: this.siteId,
							statisticalArea: this.statisticalArea,
							browserHostToEnvironmentMap: this.browserHostToEnvironmentMap,
							shouldStoreTrackingIdInCookies:
								this.shouldStoreTrackingIdInCookies,
					  }
					: undefined;

			this.updateStory({id: this.storyId, tracking});
			this.$refs.modal.close();
		},

		editScript(e) {
			/*
			We have to manually inject the Vuex store, since the editors are
			mounted outside the app scope.
			*/

			new JavaScriptEditor({
				data: { storyId: this.storyId, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
	},

	components: {
		"modal-dialog": ModalDialog,
	},
});

export default Tracking;
