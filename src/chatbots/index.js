/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
import Vue from 'vue';

import AsideNavigation from '../aside-navigation';
import ChatbotsContent from './chatbots-content';

import './index.less';
import template from './index.html';

const ChatbotsView = Vue.extend({
	template,

	components: {
		'aside-navigation': AsideNavigation,
		'chatbots-content': ChatbotsContent,
	},
});

export default ChatbotsView;
