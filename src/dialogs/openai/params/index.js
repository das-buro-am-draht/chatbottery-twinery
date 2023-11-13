const Vue = require('vue');
const locale = require('../../../locale');
const escape = require('lodash.escape');

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
			required: false,
		},
		initial: {
			type: String,
			required: false,
		},
		description: {
			type: String,
			required: false,
		},
	},

	data: () => ({
		message: '',
  	}),

	computed: {
		header() {
			return locale.say(
				'OpenAI %1$s',
				escape(this.label)
			);
		},
		advice() {
			return locale.say(
				'Use %1$s as placeholder for %2$s string',
				escape(this.placeholder),
				escape(this.label)
			);
		},
		warning() {
			return locale.say(
				'Placeholder %1$s should be set.',
				escape(this.placeholder),
				escape(this.label)
			);
		},
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
		onChange() {
			this.$dispatch('onChangeOpenaiSettings');
		},

		reset() {
			if (this.params !== this.initial) {
				this.params = this.initial;
				this.$dispatch('onChangeOpenaiSettings');
			}
		},
	},

});