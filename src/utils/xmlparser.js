// const beautify = require('xml-beautifier');
const { 
  removeEnclosingBrackets,
} = require('../data/link-parser');
const { trim } = require('./common');

const ROOT = 'root';

const attributes = (attributes) => {
  const attr = {};
  for (let i = 0; i < attributes.length; i++) {
    attr[attributes[i].name] = attributes[i].value;
  }
  return attr;
};

const xmlElement = (tag, content, attributes = null) => {
  const attr = Object.entries(attributes || {}).map(([k,v]) => `${k}="${String(v).replace(/"/g, '\"')}"`).join(' ');
  return `<${tag}${attr ? ' ' + attr : ''}>${content}</${tag}>\n`;
}

const button = (el) => {
  [label, link, func] = removeEnclosingBrackets(el.innerText).split('|');
  return {
    attributes: attributes(el.attributes),
    label: trim(label),
    link: trim(link),
    func: trim(func),
  };
};

const parse = (text) => {
  const tasks = [];
  const xml = text.replace(/<([^\/])(\S+)([^\/]*)\/>/g, '<$1$2$3></$1$2>');
  const doc = new DOMParser().parseFromString(`<${ROOT}>${xml}</${ROOT}>`, 'text/html');
  const elements = Array.from(doc.querySelector(ROOT).children);
  elements.forEach((el) => {
    const children = Array.from(el.children);
    const task = {
      type: el.nodeName.toLowerCase(),
      attributes: attributes(el.attributes),
    }

    if (task.type === 'msg') {
      const buttons = 
        children.filter((el) => {
          const tagName = el.tagName.toLowerCase();
          return tagName === 'act' || tagName === 'btn';
        }).map((el) => ({ ...button(el), action: el.tagName.toLowerCase() === 'act' }));
      if (buttons.length) {
        tasks.push({
          type: 'buttons',
          attributes: { ...task.attributes },
          buttons,
        });
        el.innerText = '';
      }

      const opt = children.filter((el) => el.tagName.toLowerCase() === 'opt').map((el) => el.innerText.trim());
      if (!opt.length) {
        const text = el.innerText.trim();
        if (text) {
          opt.push(text);
        }
      }
      task.opt = opt;
      task.type = 'txt';
      if (task.attributes.hasOwnProperty('img')) {
        task.type = 'image';
      }
    }

    task.content = el.innerHTML.trim()
      .replace(/>\s*(.+)\s*</g, '>$1<')
      .replace(/>\s*</g, '>\n<');

    if (task.type !== 'txt' || task.opt.some((option) => !!option)) {
      tasks.push(task);
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
      const opt = (task.opt || []).filter((option) => !!option);
      if (opt.length === 1)
        content = HtmlEncode(opt[0]) + '\n';
      else {
        content = opt.reduce((xml, option) => {
          return xml + xmlElement('opt', HtmlEncode(option));
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
      case 'buttons':
      case 'txt':
      case 'image':
        type = 'msg';
        break;
    }
    let value = xmlValue(task).replace(/\n</g, '\n   <');
    if (value) {
      value = '\n   ' + value.replace(/\s+$/, '') + '\n';
    }
    return xml + xmlElement(type, value, task.attributes);
  }, '');
};

module.exports = {
  parse,
  stringify,
};
