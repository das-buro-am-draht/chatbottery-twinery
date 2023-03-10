const Vue = require('vue');
const notify = require('../../ui/notify');
const locale = require('../../locale');
const { setPref } = require('../../data/actions/pref');
const openaiDefault = require('../../data/store/openai');

require('./index.less');

module.exports = Vue.extend({
	data: () => ({
		origin: null,
		openaiParams: '',
		errorMessage: '',
	}),

	template: require('./index.html'),

  ready() {
		this.openaiParams = this.openaiTags;
  },

	computed: {

		isValidJson() {
			try {
				JSON.parse(this.openaiParams);
				this.errorMessage = '';
				return true;
			} catch(e) {
				this.errorMessage = e.message;
				// if (e.message) {
				// 	const searchString = 'at position ';
				// 	const p = e.message.indexOf(searchString);
				// 	if (p >= 0) {
				// 		const matches = e.message.substring(p + searchString.length).match(/\d+/);
				// 		const position = parseInt(matches[0]);
				// 		if (!isNaN(position)) {
				// 			this.$els.openaiParams.setSelectionRange(position, position + 1);
				// 		}
				// 	}
				// }
				return false;
			}
		},

		tagPresent() {
			return this.openaiParams.indexOf('%TAG%') >= 0;
		},

		isValid() {
			return !!this.openaiParams.trim() && this.isValidJson;
		},
	},

	methods: {

		reset() {
			this.openaiParams = openaiDefault.tags;
		},

		save() {
			try {
				JSON.parse(this.openaiParams);
				this.setPref('openaiTags', this.openaiParams);
				this.$refs.modal.close();
			} catch(e) {
				notify(locale.say("Error on parsing open AI params: '%s'", e.message), 'danger');
			}
		},
	},

	vuex: {
		getters: {
			openaiTags: state => state.pref.openaiTags,
		},
		actions: { 
			setPref 
		},
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});