const Vue = require('vue');
const without = require('lodash.without');
const { updatePassage } = require('../../../../data/actions/passage');

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
			this.$parent.newTag(this.tag);
		},
		suggestions() {
			this.$parent.getSuggestions(this.tag);
		}
	},

	vuex: {
		actions: { updatePassage }
	},

	components: {
		'drop-down': require('../../../../ui/drop-down'),
		'tag-colors': require('./tag-colors'),
		'tag-types': require('./tag-types')
	}
});