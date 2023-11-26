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
		this.passages = this.story.passages
			.map((passage) => passage.name)
			.sort()
			// .concat(Object.values(specialPassages));

		const passage = this.task.attributes['passage'] || '';
		if (passage !== this.passage) {
			this.passage = passage;
		}
	},

	methods: {
		onChange(event) {
			this.task.attributes['passage'] = this.passage;
		},
	},
});
