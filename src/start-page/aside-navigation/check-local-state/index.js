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
		isLocalState() {
			const mod = "chatbot";

			try {
				localStorage.setItem(mod, mod);
				localStorage.removeItem(mod);
                this.localStorageActive = true;
				this.promtVisible = false;
				return true;
			} catch (e) {
                this.localStorageActive = false;
				this.promtVisible = true;
				return false;
			}
		},
		closePromt() {
			this.promtVisible = false;
		}
	},

	activate: function (done) {
			this.isLocalState();
			done();
	},

	components: {},

	vuex: {},
});
