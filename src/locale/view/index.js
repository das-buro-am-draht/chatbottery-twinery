/*
Allows the user to pick what locale they would like to use.
*/

import Vue from 'vue';

import './index.less';
import template from './index.html';

const LocaleView = Vue.extend({
	template,

	data: () => ({
		/* The locales we offer with their codes. */
		locales: [
			{label: 'English', code: 'en'},
		]
	}),

	computed: {
		setPref () { return this.$store._actions.setPref[0] },
		localePref () { return this.$store.getters.localePref },
	},

	methods: {
		/*
		Sets the application locale and forces a window reload
		back to the story list.
		*/

		setLocale(userLocale) {
			this.setPref({name: 'locale', value: userLocale});

			window.location.hash = 'stories';
			window.location.reload();
		}
	}
});

export default LocaleView;
