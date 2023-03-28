const parse = (text) => {
  const tasks = [];
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const elements = Array.from(doc.body.children);
  elements.forEach((el) => {
    const task = {
      type: el.nodeName.toLowerCase(),
      attr: { },
    }
    tasks.push(task);

    for (let i = 0; i < el.attributes.length; i++) {
      task.attr[el.attributes[i].name] = el.attributes[i].value;
    }
    task.text = el.innerHTML;
  });
  return tasks;
};

const stringify = (arr) => {
  return arr.reduce((text, item) => {
    const attributes = Object.entries(item.attr || {}).map(([k,v]) => `${k}="${v}"`).join(' ');
    return text += `<${item.type}${attributes ? ' ' + attributes : ''}>${item.text}</${item.type}>\n`;
  }, '');
};

module.exports = { 
  parse,
  stringify,
};