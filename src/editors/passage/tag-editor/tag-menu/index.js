const Vue = require('vue');
const without = require('lodash.without');
const { updatePassage } = require('../../../../data/actions/passage');

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

	methods: {
		remove() {
			this.updatePassage(
				this.storyId,
				this.passage.id,
				{ tags: without(this.passage.tags, this.tag) }
			);
		},
		change() {
			this.$dispatch('tag-change', this.tag);
		},
		suggestions() {
			this.$dispatch('tag_suggestion', this.tag);
		}
	},

	vuex: {
		actions: { updatePassage }
	},

	components: {
		'drop-down': require('../../../../ui/drop-down')
	}
});