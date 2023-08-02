// const beautify = require('xml-beautifier');
const { 
  removeEnclosingBrackets,
} = require('../data/link-parser');
const { trim } = require('./common');
const { createTask } = require('../utils/task');

const ROOT = 'root';

const attributes = (attributes) => {
  const attr = {};
  for (let i = 0; i < attributes.length; i++) {
    attr[attributes[i].name] = attributes[i].value;
  }
  return attr;
};

const xmlElement = (tag, content, attributes = null) => {
  const attr = Object.entries(attributes || {})
    .filter(([k,v]) => !!v)
    .map(([k,v]) => `${k}="${String(v).replace(/"/g, '\'')}"`).join(' ');
  return `<${tag}${attr ? ' ' + attr : ''}>${content}</${tag}>\n`;
}

const button = (el) => {
  [label, link, func] = removeEnclosingBrackets(trim(el.innerHTML)).split('|');
  return {
    attributes: attributes(el.attributes),
    label: trim(label),
    link: trim(link),
    func: trim(func),
  };
};

const parse = (text) => {
  const tasks = [];
  const addTask = (task) => {
    tasks.push({
      ...task,
      attributes: {
        classname: '',
        'typing-animation-time': '',
        'if': '',
        ...task.attributes,
      }
    })
  };
  const xml = text.replace(/<([^\/])(\S+)([^\/]*)\/>/g, '<$1$2$3></$1$2>');
  const doc = new DOMParser().parseFromString(`<${ROOT}>${xml}</${ROOT}>`, 'text/html');
  const elements = Array.from(doc.querySelector(ROOT).children);
  elements.forEach((el) => {
    const children = Array.from(el.children);
    const task = createTask(el.nodeName.toLowerCase(), attributes(el.attributes));

    let taskButtons;
    if (task.type === 'msg') {
      const buttons = 
        children.filter((el) => {
          const tagName = el.tagName.toLowerCase();
          return tagName === 'act' || tagName === 'btn';
        }).map((el) => ({ ...button(el), action: el.tagName.toLowerCase() === 'act' }));
      if (buttons.length) {
        taskButtons = {
          ...createTask('buttons', { ...task.attributes }),
          buttons,
        };
      }
      if (task.attributes.eval) {
        tasks.push({
          type: 'eval',
          content: '',
          attributes: { ...task.attributes },
        });
        delete task.attributes.eval;
      }
      // option texts
      task.opt = children.filter((el) => el.tagName.toLowerCase() === 'opt').map((el) => el.innerHTML.trim());
      el.innerHTML = trim(el.innerHTML.replace(/(<(opt|act|btn)[^>]*>[\s\S]*<\/(opt|act|btn)>)|(<(opt|act|btn)[^\/]*\/>)/g, ''));
      if (el.innerHTML) {
        task.opt.unshift(el.innerHTML);
      }
      if (task.attributes.hasOwnProperty('img')) {
        task.type = 'image';
      } else if (task.attributes.hasOwnProperty('src')) {
        task.type = 'iframe';
      } else if (task.attributes.hasOwnProperty('video')) {
        task.type = 'video';
      } else {
        task.type = 'txt';
      }
    }

    task.content = el.innerHTML.trim()
      .replace(/>\s*(.+)\s*</g, '>$1<')
      .replace(/>\s*</g, '>\n<');

    if (task.type !== 'txt' || task.opt.some((option) => !!option)) {
      addTask(task);
    }
    if (taskButtons) {
      addTask(taskButtons);
    }
  });
  return tasks;
};

const HtmlEncode = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\n/g, '<br>');

const xmlValue = (task) => {
  let content = task.content;
  switch (task.type) {
    case 'txt':
    case 'image':
    case 'video':
    case 'iframe':
      const opt = (task.opt || []).filter((option) => !!option);
      if (opt.length === 1)
        content = opt[0] + '\n'; // HtmlEncode(opt[0]) + '\n';
      else {
        content = opt.reduce((xml, option) => {
          return xml + xmlElement('opt', option); // HtmlEncode(option));
        }, '');
      }
      break;
    case 'buttons':
      const buttons = task.buttons.filter((button) => button.label || button.link || button.func);
      content = buttons.reduce((xml, button) => {
        const tag = button.action ? 'act' : 'btn';
        let text = `${button.label || ''}|${button.link || ''}`;
        if (button.func) {
          text += `|${button.func}`;
        }
        return xml + xmlElement(tag, `[[${text}]]`, button.attributes);
      }, '');
  }
  return content;
}

const stringify = (arr) => {
  return arr.reduce((xml, task) => {
    let type = task.type;
    switch (type) {
      case 'txt':
      case 'eval':
      case 'buttons':
      case 'image':
      case 'video':
      case 'iframe':
        type = 'msg';
        break;
    }
    let value = xmlValue(task).replace(/\n</g, '\n   <');
    if (value) {
      value = '\n   ' + value.replace(/\s+$/, '') + '\n';
    } else if (type === 'msg' && !Object.values(task.attributes).some(v => !!v)) {
      return xml;
    }
    return xml + xmlElement(type, value, task.attributes);
  }, '');
};

module.exports = {
  parse,
  stringify,
};
