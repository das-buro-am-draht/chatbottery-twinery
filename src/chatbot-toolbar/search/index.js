/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import SearchDialog from '../../dialogs/story-search';
import { regularExpression } from '../../utils/common';

import './index.less';
import template from './index.html';

const StorySearch = Vue.extend({
	template,

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

export default StorySearch;
