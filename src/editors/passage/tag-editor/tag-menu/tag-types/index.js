const Vue = require('vue');
const { updatePassage } = require('../../../../../data/actions/passage');
const { typeFromTag, nameFromTag, insertTag } = require('../../../../../utils/tags')

require('./index.less');

module.exports = Vue.extend({
	props: {
		tag: {
			type: String,
			required: true
		},
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	template: require('./index.html'),

	computed: {
		type() {
			return typeFromTag(this.tag);
		},
	},

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},
		setType(type) {
			const tag = type + nameFromTag(this.tag);

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: insertTag(this.passage.tags, tag, this.tag)
				}
			);
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: { updatePassage }
	},

	components: {
		'drop-down': require('../../../../../ui/drop-down')
	}
});