const Vue = require('vue');
const uniq = require('lodash.uniq');
const { typeFromTag, buzzwordFromTag } = require('../../../../utils/common')
const { setTagColorInStory } = require('../../../../data/actions/story');
const { updatePassage } = require('../../../../data/actions/passage');

require('./index.less');

const TYPE_MAIN        = '#'
const TYPE_GROUP       = '@'
const TYPE_SUGGESTION  = '/'
const TYPE_CONDITIONAL = '%'

module.exports = Vue.extend({
	data: () => ({
    storyId: '',
    passage: null,
    origin: null,
		tag: null,
		edit: {
			tag: '',
			type: '',
			color: null,
		}
	}),

	computed: {
		tagColors() {
			return this.getStory().tagColors;
		},
	},

	template: require('./index.html'),

  ready() {
    this.edit.color = this.getStory().tagColors[this.tag];
    if (this.tag) {
			this.edit.tag = buzzwordFromTag(this.tag);
			this.edit.type = typeFromTag(this.tag);
    }
    this.$nextTick(() => this.$els.tagName.focus());
  },

	computed: {
		isValidTag() {
			return !!this.edit.tag.trim();
		},

		isMainValid() {
			return !this.passage.tags.filter(tag => tag !== this.tag).some(tag => tag.substring(0, 1) === TYPE_MAIN);
		},
	},

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},

		setColor(color) {
			this.edit.color = color;
		},

		setType(type) {
			this.edit.type = type;
		},

		save() {
			const tagName = this.edit.tag.trim().replace(/\s/g, '-');

      if (!tagName) {
        return;
      }

			const tag = this.edit.type + tagName;

      let arr;
      if (this.tag) {
        arr = this.passage.tags.slice();
        arr[arr.findIndex(t => t === this.tag)] = tag;
      } else {
        arr = [].concat(this.passage.tags, tag);
      }

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: uniq(arr)
				}
			);

			if (this.edit.color) {
				this.setTagColorInStory(this.storyId, tag, this.edit.color)
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