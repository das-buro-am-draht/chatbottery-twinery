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
				pref: 'openaiTags',
				label: 'Tag Alternatives',
				image: 'regular-tag.svg',
				initial: openaiDefault.tags,
				placeholder: placeholders.tag,
				params: '',
		 	},
		 	phrase: {
				pref: 'openaiPhrases',
				label: 'Phrase Alternatives',
				image: 'message.svg',
				initial: openaiDefault.phrases,
				placeholder: placeholders.phrase,
				params: '',
		 	},
		 	page: {
				pref: 'openaiPage',
				label: 'Website Analysis',
				image: 'element-iframepdf.svg',
				initial: openaiDefault.page,
				placeholder: placeholders.page,
				params: '',
		 	},
		},
	}),

  ready() {
		Object.entries(this.openai).forEach(([key, openai]) => {
			if (!openai.pref) {
				console.warn(`No preference found for OpenAI Key '${key}.`)
			} else {
				openai.params = this.getPref[openai.pref];
			}
		})
  },

	computed: {
		canSave() {
			return !Object.values(this.$refs.params).some((ref) => !ref.isValid);
		},
	},

	methods: {
		save() {
			Object.entries(this.openai).forEach(([key, openai]) => {
				if (openai.pref) {
					this.setPref(openai.pref, this.$refs.params[key].params);
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