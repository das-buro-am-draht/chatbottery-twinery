// The main app running the show.

'use strict';
import Vue from 'vue';
import ui from '../../ui';
import store from '../../data/store';

const TwineApp = Vue.extend({
	template: '<div><router-view></router-view></div>',

	computed: {
		repairFormats () { return this.$store._actions.repairFormats[0] },
		repairStories () { return this.$store._actions.repairStories[0] },
		themePref () { return this.$store.getters.themePref },
	},

	mounted: function () {
		this.$nextTick(function () {
			ui.init();
			this.repairFormats();
			this.repairStories();
			document.body.classList.add(`theme-${this.themePref}`);
		});
	},

	watch: {
		themePref(value, oldValue) {
			document.body.classList.remove(`theme-${oldValue}`);
			document.body.classList.add(`theme-${value}`);
		}
	},

	store
});

export default TwineApp;
