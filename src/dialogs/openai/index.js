const Vue = require('vue');
const notify = require('../../ui/notify');
const locale = require('../../locale');
const { setPref } = require('../../data/actions/pref');
const openaiDefault = require('../../data/store/openai');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		origin: null,
		openaiTags: {
			data: '',
			message: '',
		},
		openaiAlts: {
			data: '',
			message: '',
		},
	}),

  ready() {
		this.openaiTags.data = this.getPref.openaiTags;
		this.openaiAlts.data = this.getPref.openaiAlts;
  },

	computed: {

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
			return this.openaiTags.data.indexOf('%TAG%') >= 0;
		},

		isValidOpenaiAlts() {
			try {
				JSON.parse(this.openaiAlts.data);
				this.openaiAlts.message = '';
				return !!this.openaiAlts.data.trim();
			} catch(e) {
				this.openaiAlts.message = e.message;
				return false;
			}
		},

		isOpenaiAltPresent() {
			return this.openaiAlts.data.indexOf('%PHRASE%') >= 0;
		},

		isValid() {
			return this.isValidOpenaiTags && this.isValidOpenaiAlts;
		},
	},

	methods: {

		resetOpenaiTags() {
			this.openaiTags.data = openaiDefault.tags;
		},

		resetOpenaiAlts() {
			this.openaiAlts.data = openaiDefault.alts;
		},

		save() {
			this.setPref('openaiTags', this.openaiTags.data);
			this.setPref('openaiAlts', this.openaiAlts.data);
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