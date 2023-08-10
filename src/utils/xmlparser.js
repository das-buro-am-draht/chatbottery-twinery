// const beautify = require('xml-beautifier');
const { 
  removeEnclosingBrackets,
} = require('../data/link-parser');
const { trim } = require('./common');
const { createTask } = require('../utils/task');

const ROOT = 'root';

const getAttributes = (attributes) => {
  const attr = {};
  for (let i = 0; attributes && i < attributes.length; i++) {
    attr[attributes[i].name] = attributes[i].value;
  }
  return attr;
};

const textToButton = (element) => {
  [label, link, func] = removeEnclosingBrackets(trim(element.innerHTML)).split('|');
  return {
    attributes: getAttributes(element.attributes),
    label: trim(label),
    link: trim(link),
    func: trim(func),
  };
};
  
const buttonToText = (button) => {
  let text = `${button.label || ''}|${button.link || ''}`;
  if (button.func) {
    text += `|${button.func}`;
  }
  return `[[${text}]]`;
} 

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
    let taskButtons;
    const children = Array.from(el.children);
    const task = createTask(el.nodeName.toLowerCase(), getAttributes(el.attributes));

    if (task.type === 'msg' || task.type === 'wait') {
      // option texts
      task.opt = children.filter((item) => item.tagName.toLowerCase() === 'opt').map((item) => item.innerHTML.trim());
      el.innerHTML = trim(el.innerHTML.replace(/(<(opt|act|btn)[^>]*>[\s\S]*<\/(opt|act|btn)>)|(<(opt|act|btn)[^\/]*\/>)/g, ''));
      if (el.innerHTML) {
        task.opt.unshift(el.innerHTML);
      }
    }

    switch (task.type) {
      case 'msg':
        const buttons = children.filter((item) => {
          const tagName = item.tagName.toLowerCase();
          return tagName === 'act' || tagName === 'btn';
        }).map((item) => ({ ...textToButton(item), action: item.tagName.toLowerCase() === 'act' }));
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

        if (task.attributes.hasOwnProperty('img')) {
          task.type = 'image';
        } else if (task.attributes.hasOwnProperty('src')) {
          task.type = 'iframe';
        } else if (task.attributes.hasOwnProperty('video')) {
          task.type = 'video';
        } else {
          task.type = 'txt';
        }
        break;
      case 'carousel':
        task.items = children.map((item) => {
          const child = {};
          Array.from(item.children).forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag === 'btn') {
              child.button = textToButton(el);
            } else {
              child[tag] = trim(el.innerHTML);
            }
          });
          return {
            attributes: getAttributes(item.attributes),
            title: child.title,
            text: child.text,
            description: child.description,
            button: child.button || {},
          }
        });
        break;
      case 'tiles':
        task.items = children.map((item) => {
          const child = {};
          Array.from(item.children).forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag === 'act') {
              child.link = textToButton(el);
            } else {
              child[tag] = trim(el.innerHTML);
            }
          });
          return {
            attributes: getAttributes(item.attributes),
            title: child.title,
            description: child.description,
            link: child.link || {},
          }
        });
        break;
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

const xmlElement = (tag, content, attributes = null) => {
  const attr = Object.entries(attributes || {})
    .filter(([k,v]) => !!v)
    .map(([k,v]) => `${k}="${String(v).replace(/"/g, '\'')}"`).join(' ');
  return `<${tag}${attr ? ' ' + attr : ''}>${content || ''}</${tag}>\n`;
}

const xmlValue = (task) => {
  let content = task.content;
  switch (task.type) {
    case 'txt':
    case 'wait':
    case 'image':
    case 'video':
    case 'iframe': {
      const opt = (task.opt || []).filter((option) => !!option);
      if (opt.length === 1)
        content = opt[0] + '\n'; // HtmlEncode(opt[0]) + '\n';
      else {
        content = opt.reduce((xml, option) => {
          return xml + xmlElement('opt', option); // HtmlEncode(option));
        }, '');
      }
      break;
    }
    case 'buttons': {
      const buttons = task.buttons.filter((button) => button.label || button.link || button.func);
      content = buttons.reduce((xml, button) => xml + xmlElement(button.action ? 'act' : 'btn', buttonToText(button), button.attributes), '');
      break;
    }
    case 'carousel': {
      const items = task.items.filter((item) => item.title || item.text || item.description || item.button);
      content = items.reduce((xml, item) => {
        const text = Object.entries(item).filter(([key]) => ['title', 'text', 'description', 'button'].includes(key)).reduce((xml, [key, value]) => {
          const element = (key === 'button')
            ? xmlElement('btn', buttonToText(value), value.attributes)
            : xmlElement(key, value);
          return xml + element;
        }, '\n');
        return xml + xmlElement('item', text, item.attributes);
      }, '');
      break;
    }
    case 'tiles': {
      const items = task.items.filter((item) => item.title || item.description || item.link);
      content = items.reduce((xml, item) => {
        const text = Object.entries(item).filter(([key]) => ['title', 'description', 'link'].includes(key)).reduce((xml, [key, value]) => {
          const element = (key === 'link')
            ? xmlElement('act', buttonToText(value), value.attributes)
            : xmlElement(key, value);
          return xml + element;
        }, '\n');
        return xml + xmlElement('item', text, item.attributes);
      }, '');
      break;
    }
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
