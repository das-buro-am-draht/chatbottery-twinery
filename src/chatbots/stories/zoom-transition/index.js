'use strict';
import Vue from 'vue';
import { zoomLevels } from '../../../chatbot-view'; // TODO: check ZOOM_MAPPINGS
import {thenable, symbols} from '../../../vue/mixins/thenable';

import './index.less';

const ZoomTransition = Vue.extend({
	data: () => ({
		zoom: 0,
		x: window.innerWidth / 2,
		y: window.innerHeight / 2,
		url: '',
		reverse: false,
	}),

	template: `<div id="storyEditProxy"
		:class="(reverse ? 'reverse ' : '') + zoomClass"
		:style="{transformOrigin: x + 'px ' + y + 'px'}"></div>`,

	computed: {
		zoomClass() {
			for (let desc in zoomLevels) {
				if (zoomLevels[desc] === this.zoom) {
					return 'zoom-' + desc;
				}
			}

			return '';
		},
	},

	ready() {
		/*
		Ugly hack to make this work on NW.js, which Vue doesn't seem to process
		animation events correctly for.
		*/

		window.setTimeout(this.animationend, 200);
	},

	methods: {
		animationend() {
			this[symbols.resolve]();

			/*
			Do not destroy this immediately: consumers may want to do an
			operation and call $destroy() on this afterward.
			*/
		},
	},

	mixins: [thenable]
});

export default ZoomTransition;
