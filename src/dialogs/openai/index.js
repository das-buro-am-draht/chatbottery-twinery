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
		openaiTags: '',
		openaiPhrases: '',
	}),

  ready() {
		this.openaiTags = this.getPref.openaiTags;
		this.openaiPhrases = this.getPref.openaiPhrases;
  },

	computed: {

		placeholders() {
			return placeholders;
		},

		openaiDefault() {
			return openaiDefault;
		},

		canSave() {
			return this.$refs.tag.isValid 
					&& this.$refs.phrase.isValid;
		},
	},

	methods: {

		save() {
			this.setPref('openaiTags', this.$refs.tag.params);
			this.setPref('openaiPhrases', this.$refs.phrase.params);
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
		'modal-dialog': require('../../ui/modal-dialog'),
		'openai-params': require('./params'),
	}
});