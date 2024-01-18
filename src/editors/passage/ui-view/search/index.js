const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		story: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		label: '',
		site: '',
		query: '',
		template: '',
	}),

	ready() {
		const label = (this.task.opt || [])[0] || '';
		if (label !== this.label) {
			this.label = label;
		}
		const site = this.task.attributes['site'] || '';
		if (site !== this.site) {
			this.site = site;
		}
		const query = this.task.attributes['query'] || '';
		if (query !== this.query) {
			this.query = query;
		}
		const template = this.task.attributes['template'] || '';
		if (template !== this.template) {
			this.template = template;
		}
	},

	methods: {
		onChangeLabel(event) {
			this.task.opt = this.label ? [this.label] : [];
		},
		onChangeSite(event) {
			this.task.attributes['site'] = this.site;
		},
		onChangeQuery(event) {
			this.task.attributes['query'] = this.query;
		},
		onChangeTemplate(event) {
			this.task.attributes['template'] = this.template;
		},
	},

	components: {
	},
});
