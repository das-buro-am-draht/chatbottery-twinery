// The new passage button at the bottom of the screen.

const Vue = require('vue');
const domEvents = require('../../../vue/mixins/dom-events');
const editView = require('..');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	ready() {
		this.on(window, 'resize', this.resize);
		Vue.nextTick(() => this.resize());
	},

	methods: {
		addPassage() {
			this.$dispatch('passage-create');
		},
		resize() {
			const editView = this.$parent.$el.parentNode;
			const width = editView.offsetWidth - editView.clientWidth;
			const height = editView.offsetHeight - editView.clientHeight;
			this.$el // .$els.createButton
			.style.clipPath = `inset(-15px ${width}px ${height}px -35px)`;
		},
	},

	mixins: [domEvents]
});
