const Vue = require('vue');
const uniq = require('lodash.uniq');
const { updatePassage } = require('../../../../../data/actions/passage');
const { typeFromTag, buzzwordFromTag } = require('../../../../../utils/common')

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

		isMainValid() {
			return !this.passage.tags.filter(tag => tag !== this.tag).some(tag => tag.substring(0, 1) === '#');
		},
	},

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},
		setType(type) {
			const tag = type + buzzwordFromTag(this.tag);

      const arr = this.passage.tags.slice();
      arr[arr.findIndex(t => t === this.tag)] = tag;

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: uniq(arr)
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