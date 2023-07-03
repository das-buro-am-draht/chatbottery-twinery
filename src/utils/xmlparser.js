// const beautify = require('xml-beautifier');

const parse = (text) => {
  const tasks = [];
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const elements = Array.from(doc.body.children);
  elements.forEach((el) => {
    const task = {
      type: el.nodeName.toLowerCase(),
      attr: { },
    }

    for (let i = 0; i < el.attributes.length; i++) {
      task.attr[el.attributes[i].name] = el.attributes[i].value;
    }

    if (task.type === 'txt') {
      const opt = Array.from(el.children).filter(el => el.tagName.toLowerCase() === 'opt');
      if (!opt.length){
        task.opt = [el.innerHTML.trim().replace(/<br\s*\/?>/g, '\n')];
      } else {
        task.opt = opt.map(el => el.innerHTML.trim().replace(/<br\s*\/?>/g, '\n'));
      }
    }

    task.text = el.innerHTML.trim();

    tasks.push(task);
  });
  return tasks;
};

const xmlValue = (item) => {
  if (item.type === 'txt' && item.opt && item.opt.length > 0) {
    if (item.opt.length === 1)
      item.text = item.opt[0].replace(/\n/g, '<br>');
    else {
      item.text = item.opt.reduce((prev, current) => {
        if (prev)
          prev += '\n';
        return prev + '<opt>' + current.replace(/\n/g, '<br>') + '</opt>';
      }, '');
    }
  }
  return item.text.replace(/\n</g, '\n   <');
}

const stringify = (arr) => {
  return arr.reduce((xml, item) => {
    const attributes = Object.entries(item.attr || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
    return xml += `<${item.type}${attributes ? ' ' + attributes : ''}>\n   ${xmlValue(item)}\n</${item.type}>\n`;
  }, '');
};

module.exports = {
  parse,
  stringify,
};
