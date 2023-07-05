const Vue = require('vue');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		label: {
			type: String,
			required: true,
		},
		params: {
			type: String,
			required: true,
		},
		placeholder: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		initial: {
			type: String,
			required: false,
		},
	},

	data: () => ({
		message: '',
  }),

	computed: {
		imageUrl() {
			return require('../../../common/img/' + this.image);
		},
		isValid() {
			try {
				JSON.parse(this.params);
				this.message = '';
				return true;
			} catch(e) {
				this.message = e.message;
				// if (e.message) {
				// 	const searchString = 'at position ';
				// 	const p = e.message.indexOf(searchString);
				// 	if (p >= 0) {
				// 		const matches = e.message.substring(p + searchString.length).match(/\d+/);
				// 		const position = parseInt(matches[0]);
				// 		if (!isNaN(position)) {
				// 			this.$els.params.setSelectionRange(position, position + 1);
				// 		}
				// 	}
				// }
				return false;
			}
		},
		isPlaceholderPresent() {
			return this.params.indexOf(this.placeholder) >= 0;
		},
	},

	methods: {
		reset() {
			this.params = this.initial;
		},
	},

});