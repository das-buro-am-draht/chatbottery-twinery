const Vue = require('vue');
const { trim } = require('../../../../utils/common');

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
		variable: '',
		userData: {},
	}),

	ready() {
		this.variable = this.task.attributes['var'] || '';
		if (this.story) {
			this.userData = Object.entries(this.story.userData || {})
				.filter(([k, v]) => v.type !== 'function' && v.type !== 'boolean')
				.reduce((prev, data) => {
					prev[data[0]] = data[1].type;
					return prev;
				}, {});
		}
	},

	methods: {
		onChange(event) {
			const variable = trim(this.variable);
			if (variable) {
				this.task.attributes['var'] = variable;
			} else {
				delete this.task.attributes['var'];
			}
			this.$dispatch('gui-changed');
		},
	},

	components: {
		'task-options': require('../options'),
	},
});
