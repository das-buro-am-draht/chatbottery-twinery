// The side toolbar of a story list.

const Vue = require("vue");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
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
	},

	components: {
		'story-item': require('../../story-list-view/story-item')
	},

	events: {
	},

	vuex: {
		getters: {
			stories: state => state.story.stories
		},
	}
});
