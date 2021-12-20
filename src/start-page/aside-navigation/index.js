// The side toolbar of a story list.

const Vue = require('vue');
const {setPref} = require('../../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
 
	props: {
		activeNavItem: {
			type: String,
			default: 'home'
		},
		changeActiveNavItem: {
			type: Function,
			default: () => {}
		}
	},

	methods: {
		openRedirect(url) {
			window.open(url, "_blank") || window.location.replace(url);
		}
	},

	components: {
		'quota-gauge': require('../../ui/quota-gauge'),
		'check-local-state': require('./check-local-state'),
		'check-chrome': require('./check-chrome')
	},

	vuex: {
		actions: {
			setPref
		}
	}
});
