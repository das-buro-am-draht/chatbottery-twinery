// The side toolbar of a story list.

const Vue = require('vue');
const {setPref} = require('../../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	methods: {
	},

	components: {
	},

	vuex: {
		actions: {
			setPref
		}
	}
});
