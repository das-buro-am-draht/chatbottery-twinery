const Vue = require('vue');
const { setPref } = require('../../data/actions/pref');
const openaiDefault = require('../../data/store/openai');
const { placeholders } = require('../../common/app/openai');
const locale = require('../../locale');
const { confirm } = require('../confirm');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		origin: null,
		openai: {
			prompt: {
				pref: 'openaiPrompt',
				label: locale.say('AI Prompt'),
				image: 'suggestions.svg',
				initial: openaiDefault.prompt,
				placeholder: placeholders.prompt,
				params: '',
				description: locale.say('These settings apply to the AI Prompt Component.<br><i>Story needs to be exported again for these settings to take effect.</i>'),
		 	},
		 	tag: {
				pref: 'openaiTags',
				label: locale.say('Tag Alternatives'),
				image: 'regular-tag.svg',
				initial: openaiDefault.tags,
				placeholder: placeholders.tag,
				params: '',
				description: locale.say('These settings apply to the Tag (Buzzword) Suggestions.'),
		 	},
		 	phrase: {
				pref: 'openaiPhrases',
				label: locale.say('Phrase Alternatives'),
				image: 'message.svg',
				initial: openaiDefault.phrases,
				placeholder: placeholders.phrase,
				params: '',
				description: locale.say('These settings apply to message Text Alternatives.'),
		 	},
		 	page: {
				pref: 'openaiPage',
				label: locale.say('Website Analysis'),
				image: 'element-iframepdf.svg',
				initial: openaiDefault.page,
				placeholder: placeholders.page,
				params: '',
				description: locale.say('These settings apply to External Data Website Analysis.<br>The following fields must be returned in JSON format') + ':<table><tr><th style="text-align: left">Field name</th><th style="text-align: left">Type</th></tr><tr><td>title</td><td>string</td></tr><tr><td>author</td><td>string</td></tr><tr><td>date</td><td>string</td></tr><tr><td>phrases</td><td>array</td></tr><tr><td>main_keyword</td><td>string</td></tr><tr><td>keywords</td><td>array</td></tr><tr><td>image_url</td><td>string</td></tr><tr><td>summary</td><td>string</td></tr></table>',
		 	},
		},
		modified: false,
	}),

  ready() {
		Object.entries(this.openai).forEach(([key, openai]) => {
			if (!openai.pref) {
				console.warn(`No preference found for OpenAI Key '${key}.`)
			} else {
				openai.params = this.getPref[openai.pref];
			}
		});
		this.$watch('openai', () => this.modified = true, { deep: true });
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
			this.modified = false;
			this.$refs.modal.close();
		},

		canClose() {
			if (!this.modified) {
				return true;
			}
			confirm({
				message: locale.say('There were changes detected for the OpenAI params dialog. Are you sure you want to discard those changes?'),
				buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Discard changes'),
				buttonClass: 'danger'
			}).then(() => {
				this.$refs.modal.$emit('close');
			});
			return false;
		},
	},

	events: {
		'onChangeOpenaiSettings'() {
			this.modified = true;
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