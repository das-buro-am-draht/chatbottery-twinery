
const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	methods: {
		attributes(item) {
			return Object.entries(item.attr || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
		},
		onChange(event, index) {
			this.$dispatch('gui_changed', this.gui);
		}
	}
});
