const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['task'],

	ready() {
		if (!this.task.length) {
			this.$refs.options.addNew();
		}
	},

	components: {
		'task-options': require('../options'),
	},
});
