const locale = require('../locale');

const types = {
	'txt'     : locale.say('Text message'),
	'buttons' : locale.say('Buttons'),
	'image'   : locale.say('Image'),
	'video'   : locale.say('Video'),
	'iframe'  : locale.say('iFrame / PDF'),
	'carousel': locale.say('Carousel'),
	'tiles'   : locale.say('Tiles'),
	'wait'    : locale.say('Record user input'),
	'eval'    : locale.say('Set variable'),
	'goto'    : locale.say('Goto'),
	'ai'      : locale.say('AI prompt'),
	'chat'    : locale.say('Live Chat'),
	// 'sms'     : locale.say('SMS (Voice Bot)'),
	// 'call'    : locale.say('Call Control (Voice Bot)'),
};

const clipboardType = 'text/plain';

const label = (type) => types[type] || type;

/* NOTE: all attributes and properties must be initialized for Vue::watch of the GUI to take effect
 */
const createTask = (type, attributes = {}) => {
	const task = {
		type,
		attributes: { ...attributes },
		content: '',
	};
	switch(type) {
		case 'ai':
		case 'txt':
			task.opt = [];
			break;
		case 'iframe':
			task.attributes['src'] = task.attributes['src'] || '';
			task.attributes['height'] = task.attributes['height'] || '';
			task.opt = [];
			break;
		case 'image':
			task.attributes['img'] = task.attributes['img'] || '';
			task.opt = [];
			break;
		case 'video':
			task.attributes['video'] = task.attributes['video'] || '';
			task.opt = [];
			break;
		case 'buttons':
			task.buttons = [];
			break;
		case 'carousel':
			task.items = [];
			break;
		case 'tiles':
			task.items = [];
			break;
		case 'goto':
			task.attributes['passage'] = task.attributes['passage'] || '';
			break; 
		case 'eval':
			task.attributes['eval'] = task.attributes['eval'] || '';
			break; 
		case 'wait':
			task.attributes['var'] = task.attributes['var'] || '';
			task.attributes['validate'] = task.attributes['validate'] || '';
			task.attributes['placeholder'] = task.attributes['placeholder'] || '';
			task.autocomplete = [];
			break; 
	}
	return task;
};

const clipboardTask = () => {
	return navigator.clipboard.read().then((items) => { 
		for (const item of items) {
			for (const type of item.types) {
				if (type === clipboardType) {
					return item.getType(type).then((blob) => blob && blob.text()).then((text) => {
						if (text) {
							try {
								const task = JSON.parse(text);
								if (task.type && types[task.type]) {
									return task;
								}
							} catch(e) { }
						}
					});
				}
			}
		}
	}) // .catch(() => { });
};

module.exports = { label, types, createTask, clipboardTask, clipboardType };