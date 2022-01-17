// The side toolbar of a story list.

const Vue = require('vue');
const {setPref} = require('../data/actions/pref');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storiesLength: null
	}),
 
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

	activate: function (done) {
		const storiesLength = this.stories.length;

		this.storiesLength = storiesLength;

		done();
	},

	components: {
		'quota-gauge': require('../ui/quota-gauge'),
		'check-local-state': require('./check-local-state'),
		'check-chrome': require('./check-chrome')
	},

	vuex: {
		actions: {
			setPref
		},

		getters: {
			stories: state => state.story.stories,
		},
	}
});
