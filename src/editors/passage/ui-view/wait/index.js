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
		autocomplete: '',
		showAutocomplete: false,
		userData: {},
	}),

	ready() {
		if (this.story) {
			this.userData = Object.entries(this.story.userData || {})
				.filter(([k, v]) => v.type !== 'function')
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
			this.loadValidate();
		},
		'task.autocomplete'() {
			this.loadAutocomplete();
		},
	},

	computed: {
		isValid() {
			return !this.variable || this.variable.startsWith('$');
		},
	},

	methods: {
		load() {
			this.loadVariable();
			this.loadValidate();
			this.loadAutocomplete();
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
		loadAutocomplete() {
			this.autocomplete = (this.task.autocomplete || []).join('\n');
			this.showAutocomplete = this.autocomplete
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
			const validate = trim(this.validate);
			if (validate) {
				this.task.attributes['validate'] = validate;
			} else {
				delete this.task.attributes['validate'];
			}
			this.$dispatch('gui-changed');
		},
		onChangeAutocomplete(event) {
			this.task.autocomplete = this.autocomplete.split('\n');
			this.$dispatch('gui-changed');
		},
		onShowAutocomplete() {
			this.showAutocomplete = true;
		},
	},

	components: {
		'task-options': require('../options'),
	},
});
