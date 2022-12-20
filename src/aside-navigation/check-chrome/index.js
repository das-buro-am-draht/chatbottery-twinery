// The side toolbar of a story list.

import Vue from 'vue';

import "./index.less";
import template from './index.html';

const CheckChrome = Vue.extend({
	template,

	data: () => ({
		chromeActive: false,
	}),

	beforeRouteEnter: function (done) {
		this.chromeActive = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
		done();
	},
});

export default CheckChrome;
