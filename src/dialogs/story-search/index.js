/*
A modal which allows the user to perform find and replace on a array of
passages.
*/

import Vue from 'vue';
import escapeRegexp from 'lodash.escaperegexp';

import ModalDialog from '../../ui/modal-dialog';
import StorySearchResult from './result';

import './index.less';
import template from './index.html';

const StorySearch = Vue.extend({
	template,

	data: () => ({
		story: {},
		search: '',
		replace: '',
		searchNames: true,
		caseSensitive: false,
		regexp: false,
		working: false,
		origin: null
	}),

	computed: {
		searchRegexp() {
			let flags = 'g';

			if (!this.caseSensitive) {
				flags += 'i';
			}

			let source = this.search;

			/*
			Escape regular expression characters in what the user typed unless
			they indicated that they're using a regexp.
			*/

			if (!this.regexp) {
				source = escapeRegexp(source);
			}

			return new RegExp('(' + source + ')', flags);
		},

		passageMatches() {
			if (this.search === '') {
				return [];
			}

			this.working = true;

			let result = this.story.passages.reduce((matches, passage) => {
				let numMatches = 0;
				let passageName = passage.name;
				let passageText = passage.text;
				let highlightedName = passageName;
				let highlightedText = passageText;
				let textMatches = passageText.match(this.searchRegexp);

				if (textMatches) {
					numMatches += textMatches.length;
					highlightedText = passageText.replace(
						this.searchRegexp,
						'<span class="highlight">$1</span>'
					);
				}

				if (this.searchNames) {
					let nameMatches = passageName.match(this.searchRegexp);

					if (nameMatches) {
						numMatches += nameMatches.length;
						highlightedName = passageName.replace(
							this.searchRegexp,
							'<span class="highlight">$1</span>'
						);
					}
				}

				if (numMatches > 0) {
					matches.push({
						passage,
						numMatches,
						highlightedName,
						highlightedText
					});
				}

				return matches;
			}, []);

			this.working = false;
			return result;
		}
	},

	methods: {
		expandAll() {
			this.$root.$emit('expand');
		},

		collapseAll() {
			this.$root.$emit('collapse');
		},

		replaceAll() {
			this.$root.$emit('replace');
		}
	},

	mounted: function () {
		this.$nextTick(function () {
			this.$refs.search.focus();
		});
	},

	components: {
		'modal-dialog': ModalDialog,
		'search-result': StorySearchResult
	}
});

export default StorySearch;
