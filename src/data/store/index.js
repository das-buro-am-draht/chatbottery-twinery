/*
The main module managing the application's Vuex state and mutations.
*/

import Vue from 'vue';
import semverUtils from 'semver-utils';
import Vuex from 'vuex';

import pref from './pref';
import story from './story';
import storyFormat from './story-format';
import storyActions from "../actions/story";
import { setPref } from '../../data/actions/pref';
import passageActions from '../../data/actions/passage';
import storyFormatActions from '../../data/actions/story-format';
import localStorage from '../local-storage';

Vue.use(Vuex);

const htmlEl = document.querySelector('html');

const store = new Vuex.Store({
	state: {
		appInfo: {
			name: htmlEl.getAttribute('data-app-name'),
			version: htmlEl.getAttribute('data-version'),
			buildNumber: parseInt(htmlEl.getAttribute('data-build-number')),
		},
		pref: {
			appTheme: 'light',
			defaultFormat: 'Chatbottery',
			donateShown: false,
			firstRunTime: new Date().getTime(),
			lastUpdateSeen: '',
			lastUpdateCheckTime: new Date().getTime(),
			locale:
				// window.navigator.userLanguage ||
				// window.navigator.language ||
				// window.navigator.browserLanguage ||
				// window.navigator.systemLanguage ||
				'en',
			proofingFormat: 'Illume', // 'Paperthin',
			welcomeSeen: false,
		},
		story: {
			stories: []
		},
		storyFormat: {
			formats: []
		}
	},
	mutations: {
		...pref.mutations,
		...story.mutations,
		...storyFormat.mutations,
	},
	actions: {
		...storyActions,
		setPref,
		...passageActions,
		...storyFormatActions,
	},
	getters: {
		stories: state => state.story.stories,
		allFormats: state => state.storyFormat.formats,
		allStories: state => state.story.stories,
		defaultFormatName: state => state.pref.defaultFormat,
		appInfo: state => state.appInfo,
		themePref: (state) => state.pref.appTheme,
		allFormatsSorted: (state) => {
			let result = state.storyFormat.formats.map((format) => ({
				name: format.name,
				version: format.version,
			}));

			result.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}

				if (a.name > b.name) {
					return 1;
				}

				const aVersion = semverUtils.parse(a.version);
				const bVersion = semverUtils.parse(b.version);

				if (aVersion.major > bVersion.major) {
					return -1;
				} else if (aVersion.major < bVersion.major) {
					return 1;
				} else {
					if (aVersion.minor > bVersion.minor) {
						return -1;
					} else if (aVersion.minor < bVersion.minor) {
						return 1;
					} else {
						if (aVersion.patch > bVersion.patch) {
							return -1;
						} else if (aVersion.patch < bVersion.patch) {
							return 1;
						} else {
							return 0;
						}
					}
				}
			});

			return result;
		},
		defaultFormatPref: (state) => state.pref.defaultFormat,
		proofingFormatPref: (state) => state.pref.proofingFormat,
		existingStories: (state) => state.story.stories,
		storyFormats: (state) => state.storyFormat.formats,
		localePref: state => state.pref.locale
	},
	plugins: [
		localStorage
	]
});

export default store;
