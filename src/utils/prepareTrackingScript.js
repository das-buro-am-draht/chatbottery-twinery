const prepareChattbotteryPluginUrls = ({
	matomo,
	google,
	matomoJSUrl,
	googleAnalyticsJSUrl,
}) => {
	const chattbotteryPluginUrls = [];

	matomo && matomoJSUrl && chattbotteryPluginUrls.push(matomoJSUrl);
	google &&
		googleAnalyticsJSUrl &&
		chattbotteryPluginUrls.push(googleAnalyticsJSUrl);

	return chattbotteryPluginUrls;
};

const prepareTrackingScript = ({
	matomo = false,
	google = false,
	matomoJSUrl = "",
	googleAnalyticsJSUrl = "",
	matomoPHPUrl = "",
	siteId = 1,
	statiscticalArea = "",
	browserHostToEnvironmentMap = {},
	shouldStoreTrackingIdInCookies = false,
}) => {
	const chattbotteryPluginUrls = prepareChattbotteryPluginUrls({
		matomo,
		google,
		matomoJSUrl,
		googleAnalyticsJSUrl,
	});

	let textScript = null;

	if (matomo || google) {
		textScript = `
		const w = typeof window === 'undefined' ? global : window;
		w._chattbotteryPluginUrls = ${JSON.stringify(chattbotteryPluginUrls)};
	`;
	}

	if (matomo) {
		const matomoScript = `function onChatbotteryPluginsLoaded(runtime) {
			document.addEventListener('agreed', () => {
				runtime.userData.$setUserAgreedToPrivacyPolicy();
			});
			runtime.initMatomoTracking({
				url: '${matomoPHPUrl}',
				siteId: ${siteId},
				statiscticalArea: '${statiscticalArea}',
				browserHostToEnvironmentMap: ${JSON.stringify(browserHostToEnvironmentMap)},
				shouldStoreTrackingIdInCookies: ${shouldStoreTrackingIdInCookies}
			});
			return new Promise((resolve) => {
				runtime.event.subscribe('onLiveChatPluginLoaded', () => {
					runtime.config.$maxUnmatchedBeforeLiveChat = 3;
					runtime.config.$charUnmatchedBeforeLiveChat = 64;
					const {LiveChat} = runtime;
					const userData = runtime.userData;
					LiveChat.setUserNameVariable('$name');
					LiveChat.setAllowedUserVariables('$age,$mail,$insurance');
					resolve();
				});
			});
		}`;

		textScript = `
		${textScript}
		${matomoScript}
		`;
	}

	return textScript;
};

module.exports = prepareTrackingScript;
