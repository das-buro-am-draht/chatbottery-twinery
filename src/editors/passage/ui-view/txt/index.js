const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['task'],

	ready() {
		if (this.task.opt && this.task.opt.length === 0) {
			this.$refs.options.addNew();
		}
	},

	components: {
		'task-options': require('../options'),
	},
});
