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
		openai: {
		 	tag: {
				label: 'Tag',
				image: 'regular-tag.svg',
				initial: openaiDefault.tags,
				placeholder: placeholders.tag,
				params: '',
		 	},
		 	phrase: {
				label: 'Phrase',
				image: 'message.svg',
				initial: openaiDefault.phrases,
				placeholder: placeholders.phrase,
				params: '',
		 	},
		},
		openaiPhrases: '',
	}),

  ready() {
		this.openai.tag.params = this.getPref.openaiTags;
		this.openai.phrase.params = this.getPref.openaiPhrases;
  },

	computed: {

		canSave() {
			return !Object.values(this.$refs.params).some((ref) => !ref.isValid);
		},
	},

	methods: {

		save() {
			Object.keys(this.openai).forEach((key) => {
				if (!this.$refs.params[key]) {
					console.warn(`No component found for OpenAI Key '${key}.`)
					return;
				}
				switch (key) {
					case 'tag':
						this.setPref('openaiTags', this.$refs.params[key].params);
						break;
					case 'phrase':
						this.setPref('openaiPhrases', this.$refs.params[key].params);
						break;
					default:
						console.warn(`No preference found for OpenAI Key '${key}.`)
						break;
				}
			});
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