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
const { trim } = require('../utils/common');
const beautify = require('xml-beautifier');
const importHtml = (html, lastUpdate) => {
	
	/* HTML selectors used to find data in HTML format. */

	const selectors =  {
		passage: 'tw-passage',
		story: 'tw-story',
		script: '[role=script]',
		stylesheet: '[role=stylesheet]',
		storyData: 'tw-storydata',
		tagColors: 'tw-tag',
		passageData: 'tw-passagedata',
	};
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
				storyEl.attributes.settings && storyEl.attributes.settings.value ? 
					JSON.parse(unescape(storyEl.attributes.settings.value)) : undefined,
			plugins:
				storyEl.attributes.plugins && storyEl.attributes.plugins.value ? 
					JSON.parse(unescape(storyEl.attributes.plugins.value)) : undefined,
			userData:
				storyEl.attributes.userData && storyEl.attributes.userData.value ? 
					JSON.parse(unescape(storyEl.attributes.userData.value)) : undefined,
			tagColors:
				Array.from(storyEl.querySelectorAll(selectors.tagColors))
					.reduce(
						(src, el) => {
							src[el.attributes.name.value] =
								el.attributes.color.value;
							return src;
						},
						{}
					),
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
							if (passageEl.attributes.tagsData && passageEl.attributes.tagsData.value) {
								tags = JSON.parse(passageEl.attributes.tagsData.value);
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
								passageEl.textContent
						};
					}),
		}
	));
}

const taskToXml = (task) => {
	const setAttribute = (el, name, value) => {
		el.setAttribute(name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`), value);
	};
	const createNewElement = (name, text = null) => {
		const el = document.createElement(name);
		if (text) {
			el.innerText = text;
		}
		return el;
	};
	const createNewTextElement = (name, obj) => {
		const el = createNewElement(name, trim(obj.text));
		for (let key in obj) {
			if (key !== 'text') {
				setAttribute(el, key, obj[key]);
			}
		}
		return el;
	}
	const element = document.createElement(task.type);
	for (let key in task) {
		switch (key) {
			case 'type':
				continue;
			case 'options':
				const options = task[key].filter(item => !!trim(item.text));
				if (options.length === 1)
					element.innerText = trim(options[0].text);
				else
					options.forEach(item => element.append(createNewTextElement('opt', item)));
				break;
			case 'act':
			case 'btn':
				task[key].filter(item => !!trim(item.text)).forEach(item => {
					element.append(createNewTextElement(key, item));
				});				
				break;
			case 'carouselItems':
				task[key].forEach(entry => {
					const item = createNewElement('item');
					if (entry.img)
						item.setAttribute('img', entry.img);
					if (entry.title)
						item.append(createNewElement('title', entry.title));
					if (entry.text)
						item.append(createNewElement('text', entry.text));
					if (entry.description)
						item.append(createNewElement('description', entry.description));
					(entry.buttons || []).forEach(text => {
						item.append(createNewElement('btn', text))
					})
					element.append(item);
				});
				break;
			default:
				if (['string', 'number', 'boolean'].includes(typeof task[key])) {
					setAttribute(element, key, task[key]);
				} /* else {
					throw new Error(`Unknown element type '${key}'`);
				} */
		}
	}
	return element.outerHTML;
};

const importJson = (data, lastUpdate) => {
	const story = JSON.parse(data);
	const passages = (story.passages || []).map((passage, index) => ({
		pid: (index + 1).toString(),
		left: passage._x_,
		top: passage._y_,
		width: 150,
		height: 100,
		selected: false,
		tags: passage.tags,
		name: passage.name,
		text: beautify(passage.tasks.map(taskToXml).join('')),
	}));
	// throw new Error('Not implemented!');
	return [{
		startPassagePid: (passages.findIndex(passage => passage.name === story.startPassage) + 1).toString(),
		name: story.id || story.projectName,
		ifid: null,
		lastUpdate: lastUpdate || new Date(),
		snapToGrid: false,
		storyFormat: null, // 'Chatbottery',
		storyFormatVersion: story.formatVersion,
		script: story.script,
		stylesheet: story.style,
		zoom: 1,
		settings: story.settings,
		plugins: story.plugins,
		userData: Object.entries(story.userData || {}).reduce((obj, [key, value]) => {
			const data = { value };
			switch (typeof value) {
				case 'number':
					data.type = Math.abs(value) > 100000000000 ? 'date' : 'number';
					break;
				case 'boolean':
					data.type = 'boolean';
					break;
				default:
					data.type = 'string';
					break;
			}
			obj[key] = data;
			return obj;
		}, {}),
		tagColors: {},
		passages,
	}];
};

module.exports = (data, lastUpdate) => {
	if (data.startsWith('{')) { // assume JSON 
		return importJson(data, lastUpdate); 
	} else {
		return importHtml(data, lastUpdate);
	}
};
