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
		},
		description: [],
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
		this.setDescription(this.edit.type);
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

		setDescription(type) {
			switch(type) {
				case TYPE_MAIN:
					this.description = [
						'Main Tag', 
						'Main Tag will be shown to user in "Did you mean...?"-selection, when prompt is too vague'
					];
					break;
				case TYPE_GROUP:
					this.description = [
						'Group Tag', 
						'All passages that have this tag form a semantic context - improving identification in this context'
					];
					break;
				case TYPE_SUGGESTION:
					this.description = [
						'Suggestion Tag', 
						'Tag-Phrase is autocompleted, when the user starts to type accordingly'
					];
					break;
				case TYPE_CONDITIONAL:
					this.description = [
						'Conditional Tag', 
						'Passage Content is only shown if a preset variable condition is met e.g. "isGerman"'
					];
					break;
				default:
					this.description = [
						'Regular Tag', 
						'Passage content will be shown, when user submits the exact or a similar phrase'
					];
					break;
			}
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