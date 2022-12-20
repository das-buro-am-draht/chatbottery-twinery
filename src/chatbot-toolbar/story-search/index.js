/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import SearchDialog from '../../dialogs/story-search';

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

			const value = new RegExp(
				this.search.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'), 'i'
			);

			this.$root.$emit('highlight-regexp-change', (value.source !== '(?:)') ? value : null);
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
