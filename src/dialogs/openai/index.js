const Vue = require('vue');
const notify = require('../../ui/notify');
const locale = require('../../locale');
const { setPref } = require('../../data/actions/pref');
const openaiDefault = require('../../data/store/openai');
const { placeholders } = require('../../common/app/openai');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		origin: null,
		openaiTags: {
			data: '',
			message: '',
		},
		openaiPhrases: {
			data: '',
			message: '',
		},
	}),

  ready() {
		this.openaiTags.data = this.getPref.openaiTags;
		this.openaiPhrases.data = this.getPref.openaiPhrases;
  },

	computed: {

		placeholderTag() {
			return placeholders.tag;
		},

		placeholderPhrase() {
			return placeholders.phrase;
		},

		isValidOpenaiTags() {
			try {
				JSON.parse(this.openaiTags.data);
				this.openaiTags.message = '';
				return !!this.openaiTags.data.trim();
			} catch(e) {
				this.openaiTags.message = e.message;
				// if (e.message) {
				// 	const searchString = 'at position ';
				// 	const p = e.message.indexOf(searchString);
				// 	if (p >= 0) {
				// 		const matches = e.message.substring(p + searchString.length).match(/\d+/);
				// 		const position = parseInt(matches[0]);
				// 		if (!isNaN(position)) {
				// 			this.$els.openaiTags.setSelectionRange(position, position + 1);
				// 		}
				// 	}
				// }
				return false;
			}
		},

		isOpenaiTagPresent() {
			return this.openaiTags.data.indexOf(placeholders.tag) >= 0;
		},

		isValidOpenaiPhrases() {
			try {
				JSON.parse(this.openaiPhrases.data);
				this.openaiPhrases.message = '';
				return !!this.openaiPhrases.data.trim();
			} catch(e) {
				this.openaiPhrases.message = e.message;
				return false;
			}
		},

		isOpenaiAltPresent() {
			return this.openaiPhrases.data.indexOf(placeholders.phrase) >= 0;
		},

		isValid() {
			return this.isValidOpenaiTags && this.isValidOpenaiPhrases;
		},
	},

	methods: {

		resetOpenaiTags() {
			this.openaiTags.data = openaiDefault.tags;
		},

		resetOpenaiPhrases() {
			this.openaiPhrases.data = openaiDefault.phrases;
		},

		save() {
			this.setPref('openaiTags', this.openaiTags.data);
			this.setPref('openaiPhrases', this.openaiPhrases.data);
			this.$refs.modal.close();
		},
	},

	vuex: {
		getters: {
			getPref: (state) => state.pref,
		},
		actions: { 
			setPref 
		},
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});