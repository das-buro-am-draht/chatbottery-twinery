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

const { trim } = require("../../utils/common");
const beautify = require("xml-beautifier");

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

module.exports = (data, lastUpdate) => {
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
