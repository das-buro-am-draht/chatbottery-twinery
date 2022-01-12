// The side toolbar of a story list.

const Vue = require("vue");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		chromeActive: false,
	}),

	props: {},

	methods: {
		isChrome() {
			const isChrome =
				/Chrome/.test(navigator.userAgent) &&
				/Google Inc/.test(navigator.vendor);
			if (isChrome) {
				this.chromeActive = true;
			}
		},
	},

	activate: function (done) {
		this.isChrome();
		done();
	},

	components: {},

	vuex: {},
});
