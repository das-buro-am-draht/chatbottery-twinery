/* An editor for adding and removing tags from a passage. */

const Vue = require('vue');
const {setTagColorInStory} = require('../../../data/actions/story');
const {updatePassage} = require('../../../data/actions/passage');
const TagsDialog = require('./tag-dialog');
const {openai} = require('../../../common/app/openai');
const notify = require('../../../ui/notify');
const uniq = require('lodash.uniq');
const {
	TYPE_MAIN,
	TYPE_GROUP,
	TYPE_SUGGESTION,
	TYPE_CONDITIONAL,
	nameFromTag, 
	typeFromTag, 
	insertTag
} = require('../../../utils/tags');
const locale = require('../../../locale');

require('./index.less');

const tagSortOrder = [TYPE_MAIN, TYPE_GROUP, TYPE_SUGGESTION, TYPE_CONDITIONAL];

module.exports = Vue.extend({

	data: () => ({
		loading: false,
		suggestions: [],
	}),

	computed: {
		tagColors() {
			return this.getStory().tagColors;
		},
		taglist() {
			return this.passage.tags.sort((a, b) => {
				const type_a = typeFromTag(a);
				const type_b = typeFromTag(b);
				if (type_a == type_b) 
					return 0;
				const index_a = type_a ? tagSortOrder.indexOf(type_a) : tagSortOrder.length;
				const index_b = type_b ? tagSortOrder.indexOf(type_b) : tagSortOrder.length;
				return index_a - index_b;
			});
		},
	},

	props: {
		passage: {
			type: Object,
			required: true
		},
		storyId: {
			type: String,
			required: true
		}
	},

	events: {
		'tag-change'(tag) {
			new TagsDialog({
				data: {
					storyId: this.storyId,
					passage: this.passage,
					origin: this.$el,
					tag
				},
				store: this.$store,
			}).$mountTo(this.$el);
		},

		'tag_suggestion'(tag) {
			const text = nameFromTag(tag);
			// let data = {
			// 	model: 'text-davinci-003',
			// 	input: `${text}`,
			// 	instruction: 'Finde Synonyme',
			// 	n: 5,
			// 	temperature: 0.2, // 0.6,
			// 	// top_p: 1,
			// };
			let data = {
				model: 'text-curie-001', //text-curie-001 text-davinci-003
				prompt: `5 Synonyme für ${text}`,
				max_tokens: 150,
				temperature: 0.2, // 0.6,
				// top_p: 1,
				// frequency_penalty: 1,
				// presence_penalty: 1
			};
			const storageData = localStorage.getItem('openai-params');
			if (storageData) {
				try {
					const placeholders = {"%TAG%": text};
					data = {...data, ...JSON.parse(storageData)};
					data.prompt = data.prompt.replace(/%\w+%/g, (placeholder) => placeholders[placeholder] || placeholder);
				} catch (e) {
					notify(e.message, 'danger');
				}
			}
			this.suggestions = [];
			this.loading = true;
			openai(data).then((response) => {
				const suggestions = [];
				if (response.choices) {
					response.choices.forEach(item => {
						if (typeof item.text === 'string') {
							item.text.split(',').forEach(text => {
								const suggestion = text.replace(/^[\n\r\s-\d\.]+/, '').replace(/[\n\r\s]+$/, '');
								if (suggestion) {
									suggestions.push(suggestion);
								}
							});
						}
					});
				}
				const tags = this.passage.tags.map(tag => nameFromTag(tag));
				this.suggestions = uniq(suggestions.filter(suggestion => suggestion.length < 30 && !tags.includes(suggestion)));
				if (!this.suggestions.length) {
					if (response.choices) {
						const text = response.choices.map(it => it.text).reduce((acc, it) => acc + it);
						notify(locale.say('No suggestions were found - &ldquo;%1$s&rdquo;', text), 'info');
					} else {
						notify(locale.say('No suggestions were found.'), 'info');
					}
				}
			})
			.catch((error) => notify(error.message, 'danger'))
			.finally(() => {
				this.loading = false;
				this.$els.suggestions.scrollIntoView();
			});
		}
	},

	template: require('./index.html'),

	methods: {
		getType(tag) {
			return typeFromTag(tag);
		},

		getTagname(tag) {
			return nameFromTag(tag);
		},

		getStory() {
			return this.allStories.find(s => s.id === this.storyId);
		},

		closeSuggestions() {
			this.suggestions = [];
		},

		newTag(e) {
			new TagsDialog({
				data: {
					storyId: this.storyId,
					passage: this.passage,
					origin: this.$el,
				},
				store: this.$store,
			}).$mountTo(this.$el);
		},

		addSuggestion(suggestion) {
			this.updatePassage(
				this.storyId,
				this.passage.id,
				{
					tags: insertTag(this.passage.tags, suggestion)
				}
			);
			this.suggestions.splice(this.suggestions.findIndex(s => s === suggestion), 1);
		},
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: {setTagColorInStory, updatePassage}
	},

	components: {
		'tag-menu': require('./tag-menu')
	}
});
