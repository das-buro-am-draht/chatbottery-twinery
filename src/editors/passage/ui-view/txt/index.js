const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['task'],

	components: {
		'task-options': require('../options'),
	},
});
