// const beautify = require('xml-beautifier');

const parse = (text) => {
  const tasks = [];
  const xml = text.replace(/<([^\/])(\S+)([^\/]*)\/>/g, '<$1$2$3></$1$2>');
  const doc = new DOMParser().parseFromString(xml, 'text/html');
  const elements = Array.from(doc.body.children);
  elements.forEach((el) => {
    const task = {
      type: el.nodeName.toLowerCase(),
      attributes: {},
    }

    for (let i = 0; i < el.attributes.length; i++) {
      task.attributes[el.attributes[i].name] = el.attributes[i].value;
    }

    if (task.type === 'txt') {
      const opt = Array.from(el.children).filter(el => el.tagName.toLowerCase() === 'opt');
      if (!opt.length){
        task.opt = [el.innerHTML.trim().replace(/<br\s*\/?>/g, '\n')];
      } else {
        task.opt = opt.map(el => el.innerHTML.trim().replace(/<br\s*\/?>/g, '\n'));
      }
    }

    task.content = el.innerHTML.trim()
      .replace(/>\s*(.+)\s*</g, '>$1<')
      .replace(/>\s*</g, '>\n<');

    tasks.push(task);
  });
  return tasks;
};

const xmlValue = (task) => {
  if (task.type === 'txt' && task.opt && task.opt.length > 0) {
    if (task.opt.length === 1)
      task.content = task.opt[0].replace(/\n/g, '<br>');
    else {
      task.content = task.opt.reduce((xml, current) => {
        if (xml)
          xml += '\n';
        return xml + '<opt>' + current.replace(/\n/g, '<br>') + '</opt>';
      }, '');
    }
  }
  return task.content.replace(/\n</g, '\n   <');
}

const stringify = (arr) => {
  return arr.reduce((xml, task) => {
    const attributes = Object.entries(task.attributes || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
    return xml += `<${task.type}${attributes ? ' ' + attributes : ''}>\n   ${xmlValue(task)}\n</${task.type}>\n`;
  }, '');
};

module.exports = {
  parse,
  stringify,
};
