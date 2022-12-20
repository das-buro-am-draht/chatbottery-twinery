// An individual item in the list managed by StoryListView.  This offers quick
// links for editing, playing, and deleting a story; StoryEditView handles more
// detailed changes.

"use strict";
const moment = require("moment");
import Vue from 'vue';
import ZoomTransition from "../../../story-list-view/zoom-transition";
import ItemPreview from "./item-preview";
import ItemMenu from "./item-menu";

import "./index.less";

const pluginsUrlFragments = [
	{ fragment: "plugins/chat", type: "Livechat" },
	{ fragment: "plugins/plugin.web.ga-tracking", type: "Tracking" },
	{ fragment: "plugins/matomo-tracking", type: "Tracking" },
];

const detectPlugins = (scriptData) => {
	const plugins = pluginsUrlFragments.reduce((acc, {fragment, type}) => {
		const isPlugin = scriptData.includes(fragment);

		return isPlugin ? acc.add(type) : acc;
	}, new Set([]));

	return Array.from(plugins);
};

import template from './index.html';

const StoryItem = Vue.extend({
	template,

	data: () => ({
		plugins: [],
	}),

	props: {
		story: {
			type: Object,
			required: true,
		},
	},

	beforeRouteEnter: function (done) {
		this.plugins = detectPlugins(this.story.script) || [];

		done();
	},

	components: {
		"item-preview": ItemPreview,
		"item-menu": ItemMenu,
	},

	computed: {
		lastUpdateFormatted() {
			return moment(this.story.lastUpdate).format("lll");
		},

		hue() {
			// A hue based on the story's name.

			let result = 0;

			for (let i = 0; i < this.story.name.length; i++) {
				result += this.story.name.charCodeAt(i);
			}

			return (result % 40) * 90;
		},
	},

	events: {
		// If our parent wants to edit our own model, then we do so. This is
		// done this level so that we animate the transition correctly.

		"story-edit"(id) {
			if (this.story.id === id) {
				this.edit();
			}
		},

		// if we were previously editing a story, show a zoom shrinking back
		// into us. The signature is a little bit different to save time; we
		// know the ID of the story from the route, but don't have an object.

		"previously-editing"(id) {
			if (id === this.story.id) {
				// The method for grabbing the page position of our element is
				// cribbed from http://youmightnotneedjquery.com/.

				let rect = this.$el.getBoundingClientRect();

				new ZoomTransition({
					data: {
						reverse: true,
						x: rect.left + (rect.right - rect.left) / 2,
						y: rect.top + (rect.bottom - rect.top) / 2,
					},
				}).$mountTo(document.body);
			}
		},
	},

	methods: {
		/**
		 Opens a StoryEditView for this story.

		 @method edit
		**/

		edit() {
			const pos = this.$el.getBoundingClientRect();

			new ZoomTransition({
				data: {
					x: pos.left + pos.width / 2,
					y: pos.top,
				},
			})
				.$mountTo(this.$el)
				.then(() => (window.location.hash = "#chatbots/" + this.story.id));
		},
	},
});

export default StoryItem;
