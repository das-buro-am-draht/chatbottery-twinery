/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

const Vue = require("vue");
const escape = require('lodash.escape');
const locale = require("../../../locale");
const { prompt } = require("../../../dialogs/prompt");
const StatsDialog = require("../../../dialogs/story-stats");
const PluginsDialog = require("../../../dialogs/plugins");
const UserDataDialog = require("../../../dialogs/user");
const SettingsDialog = require("../../../dialogs/settings");
const FormatDialog = require('../../../dialogs/story-format');
const ExternalDataDialog = require("../../../dialogs/external-data");
const MatomoDialog = require("../../../dialogs/matomo");
const { updateStory } = require("../../../data/actions/story");
const { proofStory } = require('../../../common/launch-story');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	props: {
		story: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		active: false,
		proofingFormat: null,
	}),

	ready() {
		this.$data.proofingFormat = this.$store.state.storyFormat.formats.find(format => format.isReview);
	},

	computed: {
		matomo() {
			const story = this.allStories.find(story => story.id === this.story.id);
			const { matomo } = story.plugins;
			return matomo && matomo.url && matomo.authToken;
		},
	},

	methods: {
		toggleDropdown() {
			this.active = !this.active;
		},
		closeDropdown() {
			this.active = false;
		},
		renameStory(e) {
			prompt({
				message: locale.say(
					"What should &ldquo;%s&rdquo; be renamed to?",
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say("Rename"),
				response: this.story.name,
				blankTextError: locale.say("Please enter a name."),
				origin: e.target,
			}).then((text) => this.updateStory(this.story.id, { name: text }));
		},
		storyStats(e) {
			new StatsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		matomoStats(e) {
			new MatomoDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		plugin(e) {
			new PluginsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		userData(e) {
			new UserDataDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		externalData(e) {
			new ExternalDataDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		settings(e) {
			new SettingsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		changeFormat(e) {
			new FormatDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},
		review() {
			proofStory(this.$store, this.story.id, this.proofingFormat.id);
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		},
		actions: {
			updateStory,
		},
	},
});
