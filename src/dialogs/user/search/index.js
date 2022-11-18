const Vue = require("vue");
const PassageEditor = require('../../../editors/passage');
const { createNewlyLinkedPassages } = require('../../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: null,
		origin: null,
    passages: [],
    gridSize: 25
  }),

  computed: {
    sortedPassages() {
      return this.passages.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

	methods: {  
		getStory() {
			return this.allStories.find((story) => story.id === this.storyId) || {};
		},

    onEntryClicked(passage, event) {
      event.preventDefault();
      const story = this.getStory();
      const oldText = passage.text;
      const afterEdit = () => {
        this.createNewlyLinkedPassages(
          story.id,
          passage.id,
          oldText,
          this.gridSize
        );
      };
      new PassageEditor({
        data: {
          passageId: passage.id,
          storyId: story.id,
          origin: event.target,
        },
        store: this.$store,
        storyFormat: {
          name: story.storyFormat,
          version: story.storyFormatVersion
        }
      })
      .$mountTo(document.body)
      .then(afterEdit)
      .catch(afterEdit);

    }
	},

	vuex: {
		actions: {
			createNewlyLinkedPassages
		},

		getters: {
			allStories: (state) => state.story.stories
		}
	},

});
