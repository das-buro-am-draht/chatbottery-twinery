const locale = require('../locale');

const types = {
	'txt'     : 'Text message',
	'buttons' : 'Buttons',
	'image'   : 'Image',
	'video'   : 'Video',
	'iframe'  : 'iFrame / PDF',
	'carousel': 'Carousel',
	'tiles'   : 'Tiles',
	'wait'    : 'Record user input',
	'eval'    : 'Set variable',
	'goto'    : 'Goto',
	'ai'      : 'AI prompt',
	'chat'    : 'Live Chat',
	// 'sms'     : locale.say('SMS (Voice Bot)'),
	// 'call'    : locale.say('Call Control (Voice Bot)'),
};

const clipboardType = 'text/plain';

const label = (type) => locale.say(types[type]) || type;

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
			task.attributes['caption'] = task.attributes['caption'] || '';
			task.attributes['initial'] = task.attributes['initial'] || 0;
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