const isValidUrl = (url) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

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

const buzzwordFromTag = (tag) => tag.replace(/^[@#\/%]?/, '');

const typeFromTag = (tag) => {
  const type = tag.substring(0, 1);
  switch (type) {
    case '#':
    case '@':
    case '/':
    case '%':
      return type;
    default:
      return '';
  }

}
  
module.exports = { 
  isValidUrl, 
  stringFromDate,
  regularExpression, 
  buzzwordFromTag,
  typeFromTag,
};