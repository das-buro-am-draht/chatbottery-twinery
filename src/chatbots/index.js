/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	components: {
		'aside-navigation': require('../aside-navigation'),
		'chatbots-content': require('./stories'),
	},
});
