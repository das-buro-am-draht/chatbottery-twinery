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
	'chat'    : 'Live Chat',
	// 'sms'     : 'SMS (Voice Bot)',
	// 'call'    : 'Call Control (Voice Bot)',
};

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
			task.autocomplete = [];
			break; 
		}
	return task;
};

module.exports = { label, types, createTask };