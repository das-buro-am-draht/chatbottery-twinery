const Vue = require('vue');
const { trim } = require('../../../../utils/common');
const specialPassages = require('../../../../data/special-passages');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		story: {
			type: Object,
			required: false,
		},
	},

	data: () => ({
		passage: '',
		passages: null,
	}),

	ready() {
		if (this.story) {
			this.passages = this.story.passages
				.map((passage) => passage.name)
				.sort()
				// .concat(Object.values(specialPassages));
		}
		this.load();
	},

	watch: {
		'task.attributes.passage'() {
			this.load();
		},
	},

	methods: {
		load() {
			const passage = this.task.attributes['passage'] || '';
			if (passage !== this.passage) {
				this.passage = passage;
			}
		},
		onChange(event) {
			const passage = this.passage;
			if (passage) {
				this.task.attributes['passage'] = passage;
			} else {
				delete this.task.attributes['passage'];
			}
			this.$dispatch('gui-changed');
		},
	},
});
