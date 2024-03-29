/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

const Vue = require('vue');
const SearchDialog = require('../../../dialogs/story-search');
const { regularExpression } = require('../../../utils/common');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		search: ''
	}),

	watch: {
		'search'() {
			/*
			Convert the entered text to regexp, escaping text, and tell our
			parent to change its highlight criteria. This is cribbed from
			https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions.
			*/

			const regex = regularExpression(this.search, 'i');

			this.$dispatch(
				'highlight-regexp-change',
				(regex.source !== '(?:)') ? regex : null
			);
		}
	},

	methods: {
		showModal(e) {
			new SearchDialog({
				data: {
					story: this.story,
					search: this.search,
					origin: e.target
				},
				store: this.$store
			}).$mountTo(document.body);
		}
	}
});
