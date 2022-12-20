/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
import Vue from 'vue';

import AsideNavigation from '../aside-navigation';
import ChatbotsContent from './stories';

import './index.less';
import template from './index.html';

module.exports = Vue.extend({
	template,

	components: {
		'aside-navigation': AsideNavigation,
		'chatbots-content': ChatbotsContent,
	},
});

export default ChatbotsView;
