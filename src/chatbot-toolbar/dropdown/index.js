/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

const Vue = require('vue');
const locale = require('../../locale');
const {prompt} = require('../../dialogs/prompt');
const StatsDialog = require('../../dialogs/story-stats');
const save = require('../../file/save');
const {publishStoryWithFormat} = require('../../data/publish');
const {loadFormat} = require('../../data/actions/story-format');
const {proofStory} = require('../../common/launch-story');

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
		active: false
	}),

	methods: {
		toggleDropdown() {
			this.active = !this.active;
		},
		renameStory(e) {
			prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.'),
				origin: e.target
			}).then(text => this.updateStory(this.story.id, {name: text}));
		},
		storyStats(e) {
			new StatsDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
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
			});
		},
		proofStory() {
			proofStory(this.$store, this.story.id);
		},
	},

	vuex: {
		actions: {
			loadFormat,
		},

		getters: {
			// allFormats: state => state.storyFormat.formats,
			appInfo: state => state.appInfo,
			// defaultFormatName: state => state.pref.defaultFormat
		}
	}
});
