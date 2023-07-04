const Vue = require('vue');
const { label, types } = require('../../../../utils/task');

module.exports = Vue.extend({

	template: require('./index.html'),

	computed: {
		types() {
			return types;
		}
	},

	methods: {
		label: (type) => label(type),

		addNew(type) {
			this.$dispatch('gui-append', type);
		}
	},

	components: {
		'drop-down': require('../../../../ui/drop-down'),
	}
});