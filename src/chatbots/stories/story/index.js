// An individual item in the list managed by StoryListView.  This offers quick
// links for editing, playing, and deleting a story; StoryEditView handles more
// detailed changes.

"use strict";
const moment = require("moment");
const Vue = require("vue");
const ZoomTransition = require("../zoom-transition");

require("./index.less");

const LIVECHAT = 'Live Chat';
const TRACKING = 'Tracking';

const pluginsUrlFragments = [
	{ fragment: "plugins/chat", type: LIVECHAT },
	{ fragment: "plugins/plugin.web.ga-tracking", type: TRACKING },
	{ fragment: "plugins/matomo-tracking", type: TRACKING },
];

const detectPlugins = (story) => {
	const plugins = new Set([]);
	if (story.plugins) {
		Object.keys(story.plugins).forEach((key) => {
			switch (key) {
				case 'google':
				case 'matomo':
					plugins.add(TRACKING);
					break;
				case 'chat':
					plugins.add(LIVECHAT);
					break;
			}
		});
	}
	pluginsUrlFragments.reduce((acc, {fragment, type}) => {
		const isPlugin = story.script.includes(fragment);
		return isPlugin ? acc.add(type) : acc;
	}, new Set([]));

	return Array.from(plugins);
};

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		plugins: [],
	}),

	props: {
		story: {
			type: Object,
			required: true,
		},
	},

	activate: function (done) {
		this.plugins = detectPlugins(this.story) || [];

		done();
	},

	components: {
		"item-preview": require("./item-preview"),
		"item-menu": require("./item-menu"),
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
