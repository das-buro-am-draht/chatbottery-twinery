const types = {
  'txt'     : 'Text',
  'image'   : 'Image',
  'msg'     : 'Message',
  'buttons' : 'Buttons',
  'wait'    : 'User Input',
  'goto'    : 'Jump Instruction',
  'carousel': 'Carousel',
  'tiles'   : 'Tiles',
  'chat'    : 'Chat',
  // 'sms'     : 'SMS (Voice Bot)',
  // 'call'    : 'Call Control (Voice Bot)',
};

const label = (type) => types[type] || type;

module.exports = { label, types };