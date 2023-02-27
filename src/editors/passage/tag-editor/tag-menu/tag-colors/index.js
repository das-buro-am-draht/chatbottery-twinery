const Vue = require('vue');
const { setTagColorInStory } = require('../../../../../data/actions/story');

require('./index.less');

module.exports = Vue.extend({
	props: {
		tag: {
			type: String,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	template: require('./index.html'),

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},
		setColor(color) {
			this.setTagColorInStory(this.storyId, this.tag, color);
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: { setTagColorInStory }
	},

	components: {
		'drop-down': require('../../../../../ui/drop-down')
	}
});