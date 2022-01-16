/*
Returns the latest story format version available, indexed by format name and
major version (as a string, not a number).
*/

const semverUtils = require('semver-utils');

module.exports = {
	latestFormatVersions: (store) => {
		const latestVersions = {};

		store.state.storyFormat.formats.forEach(format => {
			if (!format.version) {
				return;
			}

			const v = semverUtils.parse(format.version);

			if (latestVersions[format.name]) {
				const existing = latestVersions[format.name][v.major];

				if (!existing ||
					v.minor > existing.minor ||
					v.minor === existing.minor && v.patch > existing.patch) {
					latestVersions[format.name][v.major] = v;
				}
			}
			else {
				latestVersions[format.name] = {};
				latestVersions[format.name][v.major] = v;
			}
		});
		
		return latestVersions;	
	},

	/**
	 * Returns the highest story format that matches the storie's format name and major version number
	 * @param {Object} story 
	 * @param {Object[]} formats 
	 * @returns Latest story format that matches the story format props
	 */

	formatVersion: (story, formats) => {
		const filtered = formats.filter(format => 
			format.name === story.storyFormat && 
			semverUtils.parse(format.version).major === semverUtils.parse(story.storyFormatVersion).major);
		if (filtered.length === 0) {
			return null;
		} else {
			return filtered.reduce((prev, current) => {
				const pVer = semverUtils.parse(prev.version);
				const pMinor = parseInt(pVer.minor);
				const pPatch = parseInt(pVer.patch);
				const cVer = semverUtils.parse(current.version);
				const cMinor = parseInt(cVer.minor);
				const cPatch = parseInt(cVer.patch);
				return (cMinor <= pMinor && cPatch <= pPatch) ? prev : current;
			});
		}
	},

};