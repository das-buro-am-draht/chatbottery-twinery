/*
Handles importing JSON source code into story objects ready to be saved to the
store.
*/

const { trim, camelToKebab } = require("../../utils/common");
const beautify = require("xml-beautifier");

/**
 * Creates a new DOM-Elelment with specified name and optional content 
 * @param {String} name 
 * @param {String} html content inner HTML
 * @returns newly created DOM-Elelment
 */
const createNewElement = (name, html = null) => {
  const el = document.createElement(name);
  if (html) {
    el.innerHTML = html;
  }
  return el;
};

/**
 * Creates a new DOM-Elelment from an Object with specified name and content from property 'text'
 * Element attributes are set from object properties
 * @param {String} name 
 * @param {Object} obj Object to create attributes and content from
 * @returns {Element} newly created DOM-Elelment
 */
const createNewTextElement = (name, obj) => {
  const el = createNewElement(name, trim(obj.text));
  for (let key in obj) {
    if (key !== 'text') {
      el.setAttribute(camelToKebab(key), obj[key]);
    }
  }
  return el;
}

/**
 * Create XML from a passages's task element
 * @param {Object} task 
 * @returns {String} XML representing the task's properties 
 */
const taskToXml = (task) => {
	const element = document.createElement(task.type);
	for (let key in task) {
		switch (key) {
			case 'type':
				continue;
			case 'options':
				const options = task[key].filter(item => !!trim(item.text));
				if (options.length === 1)
					element.innerHTML = trim(options[0].text);
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
					element.setAttribute(camelToKebab(key), task[key]);
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
		title: passage.title,
		image: passage.image,
		summary: passage.summary,
	}));
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
