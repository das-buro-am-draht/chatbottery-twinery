const openai = require('./openai');

// A Vuex module for working with application preferences. This is a bit
// over-engieneered, as it is designed to be compatible with Twine 2.0 data
// structures, where each preference had to have its own ID.

module.exports = {
	state: {
		appTheme: 'light',
		defaultFormat: 'Chatbottery',
		donateShown: false,
		firstRunTime: new Date().getTime(),
		lastUpdateSeen: '',
		lastUpdateCheckTime: new Date().getTime(),
		locale:
			window.navigator.userLanguage ||
			window.navigator.language ||
			window.navigator.browserLanguage ||
			window.navigator.systemLanguage ||
			'en',
		proofingFormat: 'Illume', // 'Paperthin',
		welcomeSeen: false,
		openaiTags: openai.tags,
		openaiPhrases: openai.phrases,
		openaiPage: openai.page,
	},

	mutations: {
		UPDATE_PREF(state, name, value) {
			state[name] = value;
		}
	}
};
