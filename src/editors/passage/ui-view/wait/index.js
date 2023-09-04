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
				.map(([k]) => k.substring(1));
		}
		this.loadVariable();
		this.loadValidate();
		this.loadAutocomplete();
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
			return !this.variable || !this.variable.startsWith('$');
		},
	},

	methods: {
		loadVariable() {
			const variable = (this.task.attributes['var'] || '').substring(1);
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
			let variable = this.variable;
			if (variable && !variable.startsWith('$')) {
				variable = '$' + variable;
			}
			this.task.attributes['var'] = variable;
		},
		onChangeValidate(event) {
			this.task.attributes['validate'] = trim(this.validate);
		},
		onChangeAutocomplete(event) {
			this.task.autocomplete = this.autocomplete.split('\n');
		},
		onShowAutocomplete() {
			this.showAutocomplete = true;
		},
	},

	components: {
		'task-options': require('../options'),
	},
});
