// A module that adds locale-oriented filters to Vue.

const locale = require('../../locale');

module.exports = {
	addTo(Vue) {
		Vue.filter('say', locale.say.bind(locale));
		Vue.filter('sayPlural', locale.sayPlural.bind(locale));
		Vue.filter('date', locale.date.bind(locale));
		Vue.filter('time', locale.time.bind(locale));
	}
};
