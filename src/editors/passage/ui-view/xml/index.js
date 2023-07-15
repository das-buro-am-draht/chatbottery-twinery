const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['task'],

	ready() {
		Vue.nextTick(() => this.$els.text.style.transition = 'height 1s, visibility 1s, opacity 1s');
	},

	methods: {
		onChange(event) {
			this.$dispatch('gui-changed');
			this.$els.text.style.height = 'auto';
			this.$els.text.style.height = `${this.$els.text.scrollHeight}px`;		
		},
	},
});
