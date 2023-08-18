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
	},

	events: {
		/*
		Our children (e.g. the search field can tell us to change what the
		highlight filter should be.
		*/

		'highlight-regexp-change'(value) {
			this.$refs.editView.$set('highlightRegexp', value);
		},
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
