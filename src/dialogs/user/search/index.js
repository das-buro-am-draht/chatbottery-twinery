const Vue = require("vue");

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

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
