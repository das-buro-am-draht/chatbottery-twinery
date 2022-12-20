import Vue from 'vue';
import { mapActions } from 'vuex';
import semverUtils from "semver-utils";

import locale from "../../locale";
import FormatsItem from "./item";
import TabPanelItem from "../../ui/tab-panel/item";
import TabPanel from "../../ui/tab-panel";
import ModalDialog from '../../ui/modal-dialog';

import template from './index.html';

const Formats = Vue.extend({
	template,

	data: () => ({
		/* Detail about each format. */
		loadedFormats: [],

		/* Determines whether to show the error <span>, and with what text. */
		error: "",

		/* Determines whether to show the loading spinner. */
		working: true,

		/* The index number of the next format to load. */
		loadIndex: 0,

		/* Bound to the text in the "new format" input. */
		newFormatUrl: "",

		/* The origin element to show the dialog coming from. */
		origin: null,
	}),

	/*
	These are linked to the Vuex formatNames, so that when a format is deleted
	it will disappear from these properties.
	*/

	computed: {
		allFormats () { return this.$store.getters.allFormatsSorted },
		defaultFormatPref () { return this.$store.getters.defaultFormatPref },
		proofingFormatPref () { return this.$store.getters.proofingFormatPref },

		proofingFormats() {
			return this.loadedFormats.filter((format) => format.properties.proofing);
		},

		storyFormats() {
			return this.loadedFormats.filter((format) => !format.properties.proofing);
		},
	},

	methods: {
		...mapActions([
			'createFormatFromUrl',
			'loadFormat',
			'repairFormats',
		]),
		// Loads the next pending format.
		loadNext() {
			if (this.loadIndex < this.allFormats.length) {
				this.loadFormat(
					this.allFormats[this.loadIndex].name,
					this.allFormats[this.loadIndex].version
				)
					.then((format) => {
						this.loadedFormats.push(format);
						this.loadIndex++;
						this.loadNext();
					})
					.catch((e) => {
						const brokenFormat = this.allFormats[this.loadIndex];

						this.loadedFormats.push(
							Object.assign({}, brokenFormat, {
								broken: true,
								/* Force allow the format to be deleted. */
								userAdded: true,
								properties: {
									version: brokenFormat.version,
									description: locale.say(
										"This chatbot format could not be loaded (%1$s).",
										e.message
									),
								},
							})
						);

						this.loadIndex++;
						this.loadNext();
					});
			} else {
				this.working = false;
			}
		},

		/**
		 Tries to add a story format and update the list in the modal. If this
		 succeeds, the tab where the format now belongs to is shown and the
		 format description is animated in. If this fails, an error message is
		 shown to the user. This call is asynchronous.

		 @method addFormat
		 @param {String} url URL of the new story format
		**/

		addFormat() {
			this.working = true;

			this.createFormatFromUrl(this.newFormatUrl)
				.then((format) => {
					this.repairFormats();
					this.error = "";
					this.working = false;
					this.loadedFormats.push(format);

					if (format.properties.proofing) {
						this.$refs.tabs.active = 1;
					} else {
						this.$refs.tabs.active = 0;
					}
				})
				.catch((e) => {
					this.error = locale.say(
						"The chatbot format at %1$s could not be added (%2$s).",
						this.newFormatUrl,
						e.message
					);
					this.working = false;
				});
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			// Move tabs into the dialog header.

			const dialogTitle = this.$el.parentNode.querySelector(
				".modal-dialog > header .title"
			);
			const tabs = this.$el.parentNode.querySelectorAll("p.tabs-panel button");

			for (let i = 0; i < tabs.length; i++) {
				dialogTitle.appendChild(tabs[i]);
			}

			this.loadNext();
		});
	},

	components: {
		"format-item": FormatsItem,
		"tab-item": TabPanelItem,
		"tabs-panel": TabPanel,
		"modal-dialog": ModalDialog,
	},
});

export default Formats;
