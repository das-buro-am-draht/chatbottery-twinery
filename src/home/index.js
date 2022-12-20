/**
 Manages showing the starting page.

 @class StartPageView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
import Vue from 'vue';
import AsideNavigation from '../aside-navigation';
import HomeInfoContent from './info-content';

import './index.less';
import template from './index.html';

const HomeView = Vue.extend({
	template,

	components: {
		'aside-navigation': AsideNavigation,
		'info-content': HomeInfoContent,
	},
});

export default HomeView;
