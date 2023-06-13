/*
Handles importing HTML source code into story objects ready to be saved to the
store. This works on both published story files and archives.

The one difference between what's returned from this module and the usual
objects in the store is that passages have a `pid` property instead of an `id`.
Pids are sequential, not UUIDs.

It's important that this code be as efficient as possible, as it directly
affects startup time in the Twine desktop app. This module moves data from the
filesystem into local storage, and the app can't begin until it's done.
*/

const importJson = require("./importJSON");
const importHtml = require("./importHTML");

module.exports = (data, lastUpdate) => {
	if (data.startsWith('{')) { // assume JSON 
		return importJson(data, lastUpdate); 
	} else {
		return importHtml(data, lastUpdate);
	}
};
