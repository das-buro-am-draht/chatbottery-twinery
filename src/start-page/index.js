/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
const Vue = require('vue');
const {setPref} = require('../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		navItemProp: {
			type: String,
			required: true,
		},
	},

	data: () => ({
		activeNavItem: this.navItemProp || 'home',
		storyOrder: 'name',
		storyOrderDir: 'asc'
	}),

	computed: {
		sortedStories() {
			// debugger;
			/*
			If we have no stories to sort, don't worry about it.
			*/

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case 'name':
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (a.name < b.name) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				case 'lastUpdate':
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (aTime < bTime) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				default:
					throw new Error(
						`Don't know how to sort by "${this.storyOrder}"`
					);
			}
		},
	},

	methods: {
		changeActiveNavItem(navItem) {
			console.log(this.navItemProp)
			this.activeNavItem = navItem;
		},

		finish() {
			this.setPref('welcomeSeen', true);
			window.location.hash = '#stories';
		},
	},

	activate: async function (done) {
		console.log('ads')
		console.log(this.navItemProp)

		done();
	},

	components: {
		'aside-navigation': require('./aside-navigation'),
		'info-content': require('./info-content'),
		'story-item': require('../story-list-view/story-item'),
		'chatbots-content': require('./chatbots-content')
	},

	vuex: {
		getters: {
			stories: state => state.story.stories
		},
		actions: {
			setPref
		}
	}
});
