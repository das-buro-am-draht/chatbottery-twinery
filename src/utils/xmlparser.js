// const beautify = require('xml-beautifier');
const { removeEnclosingBrackets } = require('../data/link-parser');
const { trim, isEmpty } = require('./common');
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
    attributes: {
		classname: '',
		target: '',
		...getAttributes(element.attributes),
	  },
    label: trim(label),
    link: trim(link),
    func: trim(func),
  };
};
  
const buttonToText = (button) => {
  const label = trim((button.label || '').replaceAll('|', ' '));
  const link  = trim((button.link  || '').replaceAll('|', ' '));
  const func  = trim((button.func  || '').replaceAll('|', ' '));
  let text = `${label}|${link}`;
  if (func) {
    text += `|${func}`;
  }
  return `[[${text}]]`;
} 

const parse = (text) => {
  const tasks = [];
  const addTask = (task) => {
    tasks.push({
      ...task,
      attributes: {
        'if': '',
        'user-data': '',
        'classname': '',
        'typing-animation-time': '',
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

    if (task.type === 'msg' || task.type === 'wait' || task.type === 'ai') {
      // option texts
      task.opt = children.filter((item) => item.tagName.toLowerCase() === 'opt').map((item) => item.innerHTML.trim());
      if (task.type === 'wait') { 
        // autocomplete
        task.autocomplete = children.filter((item) => item.tagName.toLowerCase() === 'autocomplete').map((item) => item.innerText.trim());
      }
      el.innerHTML = trim(el.innerHTML.replace(/(<(opt|act|btn|autocomplete)[^>]*>[\s\S]*<\/(opt|act|btn|autocomplete)>)|(<(opt|act|btn|autocomplete)[^\/]*\/>)/gi, ''));
      if (el.innerHTML) {
        task.opt.unshift(el.innerHTML);
      }
    }

    switch (task.type) {
      case 'msg': {
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
      }
      case 'carousel': {
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
      }
      case 'tiles': {
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
      default:
        task.content = el.innerHTML.trim()
          .replace(/>\s*(.+)\s*</g, '>$1<')
          .replace(/>\s*</g, '>\n<');
    }
    
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
  let content = '';
  switch (task.type) {
    case 'wait': {
      if (task.autocomplete) {
        content = task.autocomplete
          .map((autocomplete) => trim(autocomplete))
          .filter((autocomplete) => !!autocomplete)
          .reduce((xml, autocomplete) => {
          return xml + xmlElement('autocomplete', HtmlEncode(autocomplete));
        }, '');
      }
    }
    case 'ai':
    case 'txt':
    case 'image':
    case 'video':
    case 'iframe': {
      const opt = (task.opt || []).filter((option) => !!option);
      if (opt.length === 1)
        content += opt[0] + '\n'; // HtmlEncode(opt[0]) + '\n';
      else {
        content += opt.reduce((xml, option) => {
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
          if (key !== 'button') {
            return xml + xmlElement(key, value);
          } else {
            const element = buttonToText(value);
            if (element) {
              return xml + xmlElement('btn', element, value.attributes);
            } else {
              return xml;
            }
          }
        }, '\n');
        return xml + xmlElement('item', text, item.attributes);
      }, '');
      break;
    }
    case 'tiles': {
      const items = task.items.filter((item) => item.title || item.description || item.link);
      content = items.reduce((xml, item) => {
        const text = Object.entries(item).filter(([key]) => ['title', 'description', 'link'].includes(key)).reduce((xml, [key, value]) => {
          if (key !== 'link') {
            return xml + xmlElement(key, value);
          } else {
            const element = buttonToText(value);
            if (element) {
              return xml + xmlElement('act', element, value.attributes);
            } else {
              return xml;
            }
          }
        }, '\n');
        return xml + xmlElement('item', text, item.attributes);
      }, '');
      break;
    }
    default:
      content = task.content || '';
      break;
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
    } else {
      switch (task.type) {
        case 'chat':
          break;
        case 'image':
          if (!task.attributes['img'])
            return xml;
          break;
        case 'video':
          if (!task.attributes['video'])
            return xml;
          break;
        case 'iframe':
          if (!task.attributes['src'])
            return xml;
          break;
        case 'goto':
          if (!task.attributes['passage'])
            return xml;
          break;
        case 'wait':
          if (!task.attributes['var'])
            return xml;
          break;
        case 'eval':
          if (!task.attributes['eval'])
            return xml;
          break;
        default:
          if (!Object.entries(task).some(([k, v]) => (k !== 'type' && k !== 'attributes' && !isEmpty(v)))) {
            return xml; // ignore task
          }
          break;
      }
    }
    return xml + xmlElement(type, value, task.attributes);
  }, '');
};

module.exports = {
  parse,
  stringify,
};
