const trim = (str) => str && str.replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');

const isEmpty = (obj) => !Object.values(obj).some((value) => (typeof value === 'object') ? !isEmpty(value) : !!value);

// eslint-disable-next-line max-len
const isValidUrl = (url) => /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);

const camelToKebab = (str) => str.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);

/**
 * Returns a string from a Date object of the pattern YYY-MM-DD
 * @param {Date} date 
 * @returns {String} YYYY-MM-DD
 */
const stringFromDate = (date) => 
            date.getFullYear() + '-' 
  + ('0' + (date.getMonth() + 1)).slice(-2) + '-'
  + ('0' + (date.getDate()     )).slice(-2);

const regularExpression = (str, flags) => new RegExp(
  str.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'), flags
);
  
module.exports = { 
  trim, 
  isEmpty,
  isValidUrl, 
  camelToKebab,
  stringFromDate,
  regularExpression, 
};