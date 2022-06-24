const codeFragments = [
	{ fragment: "_chattbotteryPluginUrls", type: "pluginUrlProperty" },
	{ fragment: "onChatbotteryPluginsLoaded", type: "pluginsLoadedFunction" },
	{ fragment: "plugins/plugin.web.ga-tracking", type: "google" },
	{ fragment: "plugins/matomo-tracking", type: "matomo" },
];

const detectCodeFragments = (scriptData) => {
	const plugins = codeFragments.reduce((acc, { fragment, type }) => {
		const isPlugin = scriptData.includes(fragment);

		return isPlugin ? [...acc, type] : acc;
	}, []);

	return Array.from(plugins);
};

const isTrackingScript = (script) => !detectCodeFragments(script).length > 0;

const isTrackingScriptActivated = (tracking = {}) => {
	const { matomo = false, google = false } = tracking || {};

	return matomo || google;
};

const prepareChattbotteryPluginUrls = ({
	matomo,
	google,
	matomoJSUrl,
	googleAnalyticsJSUrl,
}) => {
	const chattbotteryPluginUrls = [];

	matomo && 
    matomoJSUrl && 
    chattbotteryPluginUrls.push(matomoJSUrl);
	
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
	statisticalArea = "",
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
		window._chattbotteryPluginUrls = ${JSON.stringify(chattbotteryPluginUrls)};
	`;
	}

	if (matomo) {
		const matomoScript = `function onChatbotteryPluginsLoaded(runtime) {
			/* runtime.userData.$setUserAgreedToPrivacyPolicy(); */
			runtime.initMatomoTracking({
				url: '${matomoPHPUrl}',
				siteId: ${siteId},
				statisticalArea: '${statisticalArea}',
				browserHostToEnvironmentMap: ${JSON.stringify(browserHostToEnvironmentMap)},
				shouldStoreTrackingIdInCookies: ${shouldStoreTrackingIdInCookies}
			});
		}`;

		textScript = `
		${textScript}\n
		${matomoScript}\n
		`;
	}

	return textScript;
};

module.exports = {
  isTrackingScript,
  isTrackingScriptActivated,
  prepareTrackingScript
};