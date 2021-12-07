// The side toolbar of a story list.

const Vue = require('vue');
const {setPref} = require('../../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	methods: {
	},

	components: {
		'quota-gauge': require('../../ui/quota-gauge'),
	},

	vuex: {
		actions: {
			setPref
		}
	}
});
