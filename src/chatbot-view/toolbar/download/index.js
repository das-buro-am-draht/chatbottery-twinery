/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

const Vue = require('vue');
const save = require('../../../file/save');
const {loadFormat} = require('../../../data/actions/story-format');
const {publishStoryWithFormat} = require('../../../data/publish');
const {proofStory} = require('../../../common/launch-story');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	data: () => ({
		active: false,
		proofingFormat: null,
	}),

	methods: {
		toggleDropdown() {
			this.active = !this.active;
		},
		closeDropdown() {
			this.active = false;
		},
		publishStory() {
			this.loadFormat(
				this.story.storyFormat,
				this.story.storyFormatVersion
			).then(format => {
				save(
					publishStoryWithFormat(this.appInfo, this.story, format),
					this.story.name + '.html'
				);
			})
			.catch(e => {
				notify(
					locale.say(
						'The chatbot &ldquo;%1$s&rdquo; could not ' +
						'be published (%2$s).',
						this.story.name,
						e.message
					),
					'danger'
				);
			});
		},
		proofStory(id) {
			proofStory(this.$store, this.story.id, id);
		},
	},

	ready() {
		this.$data.proofingFormat = this.$store.state.storyFormat.formats.find(format => format.isStatistic);
	},

	vuex: {
		actions: {
			loadFormat,
		},

		getters: {
			appInfo: state => state.appInfo,
		}
	}
});
