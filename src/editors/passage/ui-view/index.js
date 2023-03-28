
const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	computed: {
	},

	methods: {
		attributes(item) {
			return Object.entries(item.attr || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
		},
	}
});
