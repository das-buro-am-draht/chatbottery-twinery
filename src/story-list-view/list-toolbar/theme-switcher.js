/*
A toggle between light and dark themes.
*/

import Vue from 'vue';
const { setPref } = require('../../data/actions/pref');

const ThemeSwitcher = Vue.extend({
	template: require('./theme-switcher.html'),

	methods: {
		setTheme(value) {
			this.setPref({name: 'appTheme', value});
		}
	},

	vuex: {
		actions: {
			setPref
		},

		getters: {
			themePref: state => state.pref.appTheme
		}
	}
});

export default ThemeSwitcher;
