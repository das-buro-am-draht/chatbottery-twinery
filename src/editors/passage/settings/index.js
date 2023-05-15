const Vue = require('vue');
const { updatePassage } = require('../../../data/actions/passage');
const domEvents = require('../../../vue/mixins/dom-events');

module.exports = Vue.extend({
	data: () => ({
    storyId: '',
    passage: null,
    origin: null,
		title: '',
		image: '',
		// summary: '',
	}),

	template: require('./index.html'),

  ready() {

		this.title = this.passage.title || '';
		this.image = this.passage.image || '';
		// this.summary = this.passage.summary || '';

		this.on(this.$refs.modal.$el, 'keyup', (e) => {
			if (e.keyCode === 27) {
				e.stopPropagation();
				this.$destroy(true);
			}
		});
		this.$els.title.focus();
  },

	computed: {
		parentStory() {
			return this.allStories.find(story => story.id === this.storyId);
		},
	},

	methods: {
		save() {
			this.updatePassage(
				this.parentStory.id,
				this.passage.id,
				{ 
					title: this.title ? this.title : undefined, 
					image: this.image ? this.image : undefined, 
					// summary: this.summary ? this.summary : undefined, 
				}
			);
			this.$refs.modal.close();
		},
	},

	vuex: {
		actions: {
			updatePassage,
		},

		getters: {
			allStories: state => state.story.stories
		},
	},

	components: {
		'modal-dialog': require('../../../ui/modal-dialog')
	},

	mixins: [domEvents],
});