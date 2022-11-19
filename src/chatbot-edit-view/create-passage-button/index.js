// The new passage button at the bottom of the screen.

const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	methods: {
		addPassage() {
			this.$dispatch('passage-create');
		}
	},
});
