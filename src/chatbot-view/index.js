/* The main view where story editing takes place. */

const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	/* The id of the story we're editing is provided by the router. */

	props: {
		storyId: {
			type: String,
			required: true
		}
	},

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		/* Our grid size -- for now, constant. */

		gridSize() {
			return 25;
		},
	},

	watch: {
		'story.name': {
			handler(value) {
				document.title = value;
			},

			immediate: true
		},

		'story.zoom': {
			handler(value, old) {
				/*
				Change the window's scroll position so that the same logical
				coordinates are at its center.
				*/
				
				// const halfWidth = this.$els.view.offsetWidth / 2;
				// const halfHeight = this.$els.view.offsetHeight / 2;
				// const logCenterX = (this.$els.view.scrollLeft + halfWidth) / old;
				// const logCenterY = (this.$els.view.scrollTop + halfHeight) / old;

				this.$els.view.scroll(
					0, // (logCenterX * value) - halfWidth, 
					0  // (logCenterY * value) - halfHeight
				);
			}
		}
	},

	events: {
	},

	components: {
		'chatbot-toolbar': require('./toolbar'),
		'chatbot-edit-view': require('./edit-view'),
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories,
		}
	},
});
