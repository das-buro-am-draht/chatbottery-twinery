/* An editor for adding and removing tags from a passage. */

const Vue = require('vue');
const {setTagColorInStory} = require('../../../data/actions/story');
const {updatePassage} = require('../../../data/actions/passage');
const TagDialog = require('./tag-dialog');
const {tagSuggestions} = require('../../../common/app/openai');
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
const escape = require('lodash.escape');
const domEvents = require('../../../vue/mixins/dom-events');

require('./index.less');

const tagSortOrder = [TYPE_MAIN, TYPE_GROUP, TYPE_SUGGESTION, TYPE_CONDITIONAL];

module.exports = Vue.extend({

	data: () => ({
		loading: false,
		suggestions: [],
	}),

	ready() {
		this.on(this.$parent.$els.dlg, 'keydown', (e) => {
			if (e.keyCode === 84 && e.altKey) {
				e.stopPropagation();
				this.changeTag();
			}
		});
	},

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

		changeTag(tag = null) {
			new TagDialog({
				data: {
					storyId: this.storyId,
					passage: this.passage,
					origin: this.$parent.$els.dlg,
					tag,
				},
				store: this.$store,
			}).$mountTo(this.$el);
		},

		getSuggestions(tag) {
			const text = nameFromTag(tag);
			this.suggestions = [];
			Vue.nextTick(() => this.$els.suggestions.scrollIntoView());
			this.loading = true;
			Promise.resolve(this.openaiTags)
				.then((params) => tagSuggestions(params, text))
				.then((suggestions) => {
					const tags = this.passage.tags.map(tag => nameFromTag(tag));
					this.suggestions = uniq(suggestions.filter(suggestion => /*suggestion.length < 30 &&*/ !tags.includes(suggestion)));
					if (!this.suggestions.length) {
						notify(locale.say('No suggestions were found.'), 'info');
					}
				})
				.catch((error) => notify(escape(error.message), 'danger'))
				.finally(() => {
					this.loading = false;
					Vue.nextTick(() => this.$els.suggestions.scrollIntoView());
				});
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
			allStories: state => state.story.stories,
			openaiTags: state => state.pref.openaiTags,
		},
		actions: {setTagColorInStory, updatePassage}
	},

	components: {
		'tag-menu': require('./tag-menu')
	},

	mixins: [domEvents]
});
