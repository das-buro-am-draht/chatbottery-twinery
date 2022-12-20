/*
Allows the user to pick what locale they would like to use.
*/

import Vue from 'vue';
import isElectron from '../../electron/is-electron';
import {setPref}from '../../data/actions/pref';

import './index.less';
import template from './index.html';

const LocaleView = Vue.extend({
	template,
	data: () => ({
		/* The locales we offer with their codes. */

		locales: [
			// {label: 'Castellano', code: 'es'},
			// {label: 'Catal&agrave;', code: 'ca'},
			// {label: '&Ccaron;e&scaron;tina', code: 'cs'},
			// {label: 'Chinese', code: 'zh-cn'},
			// {label: 'Dansk', code: 'da'},
			// {label: 'Deutsch', code: 'de'},
			{label: 'English', code: 'en'},
			// {label: 'Fran&ccedil;ais', code: 'fr'},
			// {label: 'Italiano', code: 'it'},
			// {label: 'Bahasa Melayu', code: 'ms'},
			// {label: 'Nederlands', code: 'nl'},
			// {label: '日本語', code: 'jp'},
			// {label: 'Portugu&ecirc;s', code: 'pt-pt'},
			// {label: 'Portugu&ecirc;s Brasileiro', code: 'pt-br'},
			// {label: 'русский', code: 'ru'},
			// {label: 'Slovenščina', code: 'sl'},
			// {label: 'Suomi', code: 'fi'},
			// {label: 'Svenska', code: 'sv'},
			// {label: 'T&uuml;rk&ccedil;e', code: 'tr'},
			// {label: 'Українська (клясична)', code: 'uk'}
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

			if (isElectron()) {
				window.twineElectron.ipcRenderer.send('app-relaunch');
			} else {
				window.location.hash = 'stories';
				window.location.reload();
			}
		}
	},
});

export default LocaleView;
