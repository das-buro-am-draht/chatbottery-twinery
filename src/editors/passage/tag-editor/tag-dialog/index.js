const Vue = require('vue');
const { typeFromTag, nameFromTag } = require('../../../../utils/tags')
const { setTagColorInStory } = require('../../../../data/actions/story');
const { updatePassage } = require('../../../../data/actions/passage');
const { TYPE_MAIN,
				TYPE_GROUP,
				TYPE_SUGGESTION,
				TYPE_CONDITIONAL,
				insertTag,
			} = require('../../../../utils/tags');
const notify = require('../../../../ui/notify');
const locale = require('../../../../locale');

require('./index.less');


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
		description: null,
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
			this.edit.tag = nameFromTag(this.tag);
			this.edit.type = typeFromTag(this.tag);
    }
		this.$nextTick(() => this.$els.tagName.focus());
  },

	computed: {
		isValidTag() {
			return !!this.edit.tag.trim();
		},

		isMainValid() {
			return !(this.edit.type === TYPE_MAIN && this.passage.tags.filter(tag => tag !== this.tag).some(tag => tag.substring(0, 1) === TYPE_MAIN));
		},

		isValid() {
			return this.isValidTag; // && this.isMainValid;
		},
	},

	methods: {
		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},

		setDescription(type, event) {
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
			const pos = this.$els.description.getBoundingClientRect().right 
								- event.target.getBoundingClientRect().right + 4;
			this.$els.descArrow.style.right = String(pos) + 'px';
			this.$els.descArrow.hidden = false;
		},

		clearDescription() {
			this.$els.descArrow.hidden = true;
			this.description = null;
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
			if (tag != this.tag && this.passage.tags.includes(tag)) {
				notify(locale.say('Tag &ldquo;%1$s&rdquo; already exists.', tag), 'info');
				return;
			}

			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: insertTag(this.passage.tags, tag, this.tag)
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