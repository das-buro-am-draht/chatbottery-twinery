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

const createTask = (type, attributes = {}) => {
  const task = {
    type,
    attributes,
    content: '',
  };
  switch(type) {
    case 'txt':
      task.opt = [];
      break;
    case 'image':
    case 'video':
    case 'iframe':
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
  }
  return task;
};

module.exports = { label, types, createTask };