// The side toolbar of a story list.

const Vue = require("vue");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		localStorageActive: true,
		promtVisible: false
	}),

	props: {},

	methods: {
		closePromt() {
			this.promtVisible = false;
		}
	},

	activate: function (done) {
		try {
			const mod = "chatbot";
			localStorage.setItem(mod, mod);
			localStorage.removeItem(mod);
			this.localStorageActive = true;
			this.promtVisible = false;
		} catch (e) {
			this.localStorageActive = false;
			this.promtVisible = true;
		}
		done();
	},

	components: {},

	vuex: {},
});
