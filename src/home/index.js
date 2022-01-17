/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
	},

	data: () => ({}),

	methods: {},

	components: {
		'aside-navigation': require('../aside-navigation'),
		'info-content': require('./info-content'),
	},

	vuex: {}
});
