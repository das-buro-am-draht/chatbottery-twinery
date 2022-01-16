// The side toolbar of a story list.

const Vue = require("vue");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		chromeActive: false,
	}),

	activate: function (done) {
		this.chromeActive = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		done();
	},
});
