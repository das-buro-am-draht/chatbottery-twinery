// The side toolbar of a story list.

import Vue from 'vue';

import "./index.less";
import template from './index.html';

const CheckLocalState = Vue.extend({
	template,

	data: () => ({
		localStorageActive: true,
		promtVisible: false
	}),

	methods: {
		closePromt() {
			this.promtVisible = false;
		}
	},

	beforeRouteEnter: function (done) {
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
});

export default CheckLocalState;
