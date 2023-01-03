/*
A function that checks for an update to Chatbottery, and displays a confirm dialog
asking the user to download it.
*/

import checkForUpdate from '../../common/app/update-check';
import { confirm } from '../confirm';
import locale from '../../locale';

/*
How often we check for a new version of Chatbottery, in milliseconds. This is
currently one day.
*/

const CHECK_DELAY = 1000 * 60 * 60 * 24;

const appUpdate = {
	check(store) {
		/*
		Force the last update we've seen to be at least the current app
		version.
		*/

		if (!store.state.pref.lastUpdateSeen ||
			store.state.pref.lastUpdateSeen < store.state.appInfo.buildNumber) {
			store._actions.setPref[0]({name: 'lastUpdateSeen', value: store.state.appInfo.buildNumber});
		}

		/* Is there a new update since we last checked? */

		const checkTime = store.state.pref.lastUpdateCheckTime + CHECK_DELAY;

		if (new Date().getTime() > checkTime) {
			checkForUpdate(
				store.state.pref.lastUpdateSeen,
				({ buildNumber, version, url }) => {
					store._actions.setPref[0]({name: 'lastUpdateSeen', value: buildNumber});

					confirm({
						message:
							/*
							L10n: The <span> will have a version number, i.e.
							2.0.6, interpolated into it.
							*/
							locale.say('A new version of Chatbottery, <span class="version"></span>, has been released.').replace('><', '>' + version + '<'),

						buttonLabel:
							'<i class="fa fa-download"></i>' +
							locale.say('Download'),

						cancelLabel:
							/*
							L10n: A polite rejection of a request, in the sense
							that the answer may change in the future.
							*/
							locale.say('Not Right Now'),

						buttonClass:
							'download primary',

						modalClass:
							'info',
					})
					.then(() => { window.open(url); });
				}
			);
		}
	}
};

export default appUpdate;
