// A container for tabs.

import Vue from 'vue';

import template from './index.html';

const TabPanel = Vue.extend({
	template,

	props: {
		active: {
			type: Number,
			default: 0
		}
	},

	data: () => ({}),

	computed: {
		singleWidthPercent() {
			return 1 / this.$children.length * 100;
		}
	}
});

export default TabPanel;
