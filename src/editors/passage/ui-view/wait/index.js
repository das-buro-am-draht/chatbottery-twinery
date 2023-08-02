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
		validate: '',
		userData: {},
	}),

	ready() {
		if (this.story) {
			this.userData = Object.entries(this.story.userData || {})
				.filter(([k, v]) => v.type !== 'function' && v.type !== 'boolean')
				.reduce((prev, data) => {
					prev[data[0]] = data[1].type;
					return prev;
				}, {});
		}
		this.load();
	},

	watch: {
		'task.attributes.var'() {
			this.loadVariable();
		},
		'task.attributes.validate'() {
			this.loadVariable();
		},
	},

	methods: {
		load() {
			this.loadVariable();
			this.loadValidate();
		},
		loadVariable() {
			const variable = this.task.attributes['var'] || '';
			if (variable !== this.variable) {
				this.variable = variable;
			}
		},
		loadValidate() {
			const validate = this.task.attributes['validate'] || '';
			if (validate !== this.validate) {
				this.validate = validate;
			}
		},
		onChangeVariable(event) {
			const variable = trim(this.variable);
			if (variable) {
				this.task.attributes['var'] = variable;
			} else {
				delete this.task.attributes['var'];
			}
			this.$dispatch('gui-changed');
		},
		onChangeValidate(event) {
			const variable = trim(this.variable);
			if (variable) {
				this.task.attributes['validate'] = variable;
			} else {
				delete this.task.attributes['validate'];
			}
			this.$dispatch('gui-changed');
		},
	},

	components: {
		'task-options': require('../options'),
	},
});
