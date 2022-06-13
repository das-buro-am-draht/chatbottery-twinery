const codeFragments = [
	{ fragment: "_chattbotteryPluginUrls", type: "pluginUrlProperty" },
	{ fragment: "onChatbotteryPluginsLoaded", type: "pluginsLoadedFunction" },
	{ fragment: "plugins/chat", type: "chat" },
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

module.exports = isTrackingScript;
