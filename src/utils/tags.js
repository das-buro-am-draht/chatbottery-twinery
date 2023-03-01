const uniq = require('lodash.uniq');

const TYPE_MAIN        = '#'
const TYPE_GROUP       = '@'
const TYPE_SUGGESTION  = '/'
const TYPE_CONDITIONAL = '%'

const buzzwordFromTag = (tag) => tag.replace(/^[@#\/%]?/, '');

const typeFromTag = (tag) => {
  const type = tag.substring(0, 1);
  switch (type) {
    case TYPE_MAIN:
    case TYPE_GROUP:
    case TYPE_SUGGESTION:
    case TYPE_CONDITIONAL:
      return type;
    default:
      return '';
  }
}

const insertTag = (tags, tag, tagOld = null) => {
  let arr = tags.slice();
  const index = tagOld ? arr.findIndex(t => t === tagOld) : -1;
  if (typeFromTag(tag) === TYPE_MAIN) {
    arr = arr.map((t, i) => i !== index && typeFromTag(t) === TYPE_MAIN ? buzzwordFromTag(t) : t);
  }
  if (index < 0) {
    arr.push(tag);
  } else {
    arr[index] = tag;
  }
  return uniq(arr);
}

module.exports = { 
  TYPE_MAIN,
  TYPE_GROUP,
  TYPE_SUGGESTION,
  TYPE_CONDITIONAL,
  buzzwordFromTag,
  typeFromTag,
  insertTag,
};