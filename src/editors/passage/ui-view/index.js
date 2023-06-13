const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	methods: {
		attributes(item) {
			return Object.entries(item.attr || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
		},
		onChange(event, index) {
			this.$dispatch('gui_changed', this.gui);
		},
		setIdx(index, event) {
			event.dataTransfer.setData("text", index);
		},
		switchToIndex(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData("text"));
			event.dataTransfer.clearData("text");
			this.gui.splice(toIdx, 0, this.gui[fromIdx]);

			const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
			this.gui.splice(removeIdx, 1);

			this.$dispatch('gui_changed', this.gui);
			event.preventDefault();
		}
	}
});
