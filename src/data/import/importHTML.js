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

const { unescape } = require("lodash");

/* HTML selectors used to find data in HTML format. */

const selectors =  {
  passage: 'tw-passage',
  story: 'tw-story',
  script: '[role=script]',
  stylesheet: '[role=stylesheet]',
  storyData: 'tw-storydata',
  tagColors: 'tw-tag',
  externalData: 'tw-externaldata',
  externalItem: 'tw-externalitem',
  passageData: 'tw-passagedata',
};

const parse = (element) => element && element.value ? JSON.parse(unescape(element.value)) : undefined;

module.exports = (html, lastUpdate) => {
  const nodes = document.createElement('div');
	nodes.innerHTML = html;

	return Array.from(nodes.querySelectorAll(selectors.storyData)).map(storyEl => (
		/*
		Converts a DOM <tw-storydata> element to a story object matching the format in
		the store.
		*/
		{
			/*
			Important: this is the passage's pid (a one-off id created at publish
			time), *not* a database id.
			*/
	
			startPassagePid:
				storyEl.attributes.startnode ?
					storyEl.attributes.startnode.value : null,
			name:
				storyEl.attributes.name ?
					storyEl.attributes.name.value : null,
			ifid:
				storyEl.attributes.ifid ?
					storyEl.attributes.ifid.value : null,
			lastUpdate:
				lastUpdate || new Date(),
			snapToGrid:
				false,
			storyFormat:
				storyEl.attributes.format ?
					storyEl.attributes.format.value : null,
			storyFormatVersion:
				storyEl.attributes['format-version'] ?
					storyEl.attributes['format-version'].value : null,
			script:
				Array.from(storyEl.querySelectorAll(selectors.script))
					.map(el => el.textContent)
					.join('\n'),
			stylesheet:
				Array.from(storyEl.querySelectorAll(selectors.stylesheet))
					.map(el => el.textContent)
					.join('\n'),
			zoom:
				storyEl.attributes.zoom ?
					parseFloat(storyEl.attributes.zoom.value) : 1,
			settings:
				parse(storyEl.attributes.settings),
			plugins:
				parse(storyEl.attributes.plugins),
			userData:
				parse(storyEl.attributes.userData),
			tagColors:
				Array.from(storyEl.querySelectorAll(selectors.tagColors))
					.reduce(
						(src, el) => {
							src[el.attributes.name.value] =
								el.attributes.color.value;
							return src;
						}, {}
					),
			externalData: 
				Array.from(storyEl.querySelectorAll(selectors.externalData))
					.map((listEl) => ({
						name: listEl.attributes.name.value || '',
						items: Array.from(listEl.querySelectorAll(selectors.externalItem))
							.map((itemEl) => parse(itemEl.attributes.data)),
					})),
			passages:
				Array.from(storyEl.querySelectorAll(selectors.passageData))
					.map(passageEl => {
						const pos = passageEl.attributes.position.value
							.split(',')
							.map(Math.floor);
	
						let size = [100, 100];
	
						if (passageEl.attributes.size) {
							size = passageEl.attributes.size.value
								.split(',')
								.map(Math.floor);
						}
	
						let tags = passageEl.attributes.tags.value === '' 
							? []
							: passageEl.attributes.tags.value.split(/\s+/);
						try {
							if (passageEl.attributes.tagsdata && passageEl.attributes.tagsdata.value) {
								tags = JSON.parse(passageEl.attributes.tagsdata.value);
							}
						} catch(e) {
							console.error(`Error loading tags for passage '${passageEl.attributes.name.value}'.`, e);
						}
	
						return {
							/* Again, a one-off id, not a database id. */
	
							pid:
								passageEl.attributes.pid.value,
							left:
								pos[0],
							top:
								pos[1],
							width:
								size[0],
							height:
								size[1],
							selected:
								false,
							tags,
							name:
								passageEl.attributes.name.value,
							text:
								passageEl.textContent,
						};
					}),
		}
	));
}
