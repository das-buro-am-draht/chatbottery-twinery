// The side toolbar of a story list.

const Vue = require('vue');
const {setPref} = require('../data/actions/pref');
const FormatsDialog = require("../dialogs/formats");
const isElectron = require('../electron/is-electron');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storiesLength: null,
		languages: [
			{label: 'English', code: 'en'},
			{label: 'Deutsch', code: 'de'},
			// {label: 'Castellano', code: 'es'},
			// {label: 'Català', code: 'ca'},
			// {label: 'Čeština', code: 'cs'},
			// {label: 'Chinese', code: 'zh-cn'},
			// {label: 'Dansk', code: 'da'},
			// {label: 'Français', code: 'fr'},
			// {label: 'Italiano', code: 'it'},
			// {label: 'Bahasa Melayu', code: 'ms'},
			// {label: 'Nederlands', code: 'nl'},
			// {label: '日本語', code: 'jp'},
			// {label: 'Português', code: 'pt-pt'},
			// {label: 'Português Brasileiro', code: 'pt-br'},
			// {label: 'русский', code: 'ru'},
			// {label: 'Slovenščina', code: 'sl'},
			// {label: 'Suomi', code: 'fi'},
			// {label: 'Svenska', code: 'sv'},
			// {label: 'Türkçe', code: 'tr'},
			// {label: 'Українська (клясична)', code: 'uk'}
		]
	}),
 
	props: {
		activeNavItem: {
			type: String,
			default: 'home'
		},
	},

	computed: {
		locales() {
			const code = this.locale;
			return this.languages; // .filter((language) => language.code !== code);
		},
		locale() {
			return this.getPref.locale;
		}
	},

	methods: {
		openRedirect(url) {
			window.open(url, "_blank") || window.location.replace(url);
		},
		openFormats(e) {
			new FormatsDialog({
				store: this.$store,
				data: { origin: e.target },
			}).$mountTo(document.body);
		},
		/*
		Sets the application locale and forces a window reload
		back to the story list.
		*/
		setLocale(userLocale) {
			this.setPref('locale', userLocale);
			if (isElectron()) {
				window.twineElectron.ipcRenderer.send('app-relaunch');
			} else {
				// window.location.hash = 'stories';
				window.location.reload();
			}
		},
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
			setPref,
		},
		getters: {
			appInfo: state => state.appInfo,
			stories: state => state.story.stories,
			getPref: (state) => state.pref,
		},
	}
});
