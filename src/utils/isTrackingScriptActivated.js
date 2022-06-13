const isTrackingScriptActivated = (tracking = {}) => {
	const { matomo = false, google = false } = tracking || {};

	return matomo || google;
};

module.exports = isTrackingScriptActivated;
