// The new passage button at the bottom of the screen.

import Vue from 'vue';

import './index.less';
import template from './index.html';

const PassageButton = Vue.extend({
	template,

	methods: {
		addPassage() {
			this.$dispatch('passage-create');
		}
	},
});

export default PassageButton;
