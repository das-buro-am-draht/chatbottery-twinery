const Vue = require('vue');
const uniq = require('lodash.uniq');
const { setTagColorInStory } = require('../../../../data/actions/story');
const { updatePassage } = require('../../../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
    storyId: '',
    passage: null,
    origin: null,
		tag: null,
    color: null,
	}),

	computed: {
		tagColors() {
			return this.getStory().tagColors;
		},
	},

	template: require('./index.html'),

  ready() {
    this.color = this.getStory().tagColors[this.tag];
    if (this.tag) {
      this.$nextTick(() => this.$els.tagName.value = this.tag);	
    }
    this.$nextTick(() => this.$els.tagName.focus());
  },

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},

		setColor(color) {
			this.color = color;
      this.save();
		},

		save() {
			const tagName = this.$els.tagName.value.trim().replace(/\s/g, '-');

      if (!tagName) {
        return;
      }

			/* Clear the tagName element while it's transitioning out. */

			this.$els.tagName.value = '';

      let arr;
      if (this.tag) {
        arr = this.passage.tags.slice();
        arr[arr.findIndex(t => t === this.tag)] = tagName;
      } else {
        arr = [].concat(this.passage.tags, tagName);
      }

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: uniq(arr)
				}
			);

			if (this.color) {
				this.setTagColorInStory(this.storyId, tagName, this.color)
			}

			this.$refs.modal.close();
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: { setTagColorInStory, updatePassage }
	},

	components: {
		'modal-dialog': require('../../../../ui/modal-dialog')
	}
});