const types = {
  'txt'     : 'Text messages',
  'msg'     : 'Messages',
  'later'   : 'Delayed Message',
  'wait'    : 'User Input',
  'goto'    : 'Deviation',
  'carousel': 'Carousel',
  'tiles'   : 'Tiles',
  'chat'    : 'Chat',
  'sms'     : 'SMS (Voice Bot)',
  'call'    : 'Call Control (Voice Bot)',
};

const label = (type) => types[type];

module.exports = { label, types };