import Vue from "vue";

import './index.less';
import template from './index.html';

module.exports = Vue.extend({
	template,

	data: () => ({
		origin: null,
    passages: [],
    x: 0,
    y: 0,
  }),

  computed: {
    sortedPassages() {
      return this.passages.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

	methods: {  
    onEntryClicked(passage) {
      this.$dispatch('passage-edit', passage);
    }
	},

});
