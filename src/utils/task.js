const types = {
  'txt'     : 'Text',
  'buttons' : 'Buttons',
  'image'   : 'Image',
  'video'   : 'Video',
  'iframe'  : 'IFrame / PDF',
  'wait'    : 'User Input',
  'goto'    : 'Jump Instruction',
  'carousel': 'Carousel',
  'tiles'   : 'Tiles',
  'chat'    : 'Chat',
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
      task.opt = [''];
      break;
    case 'image':
    case 'video':
    case 'iframe':
      task.opt = [];
      break;
    case 'buttons':
      task.buttons = [];
      break;
  }
  return task;
};


module.exports = { label, types, createTask };