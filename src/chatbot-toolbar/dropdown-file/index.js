/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

const Vue = require("vue");
const locale = require("../../locale");
const { prompt } = require("../../dialogs/prompt");
const StatsDialog = require("../../dialogs/story-stats");
const PluginDialog = require("../../dialogs/plugin");
const UserDataDialog = require("../../dialogs/user");
const FormatDialog = require('../../dialogs/story-format');
// const FormatsDialog = require("../../dialogs/formats");
// const ClickOutside = require('vue-click-outside');
const { updateStory } = require("../../data/actions/story");

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
	}),

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
		plugin(e) {
			new PluginDialog({
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
		changeFormat(e) {
			new FormatDialog({
				data: {storyId: this.story.id, origin: e.target},
				store: this.$store
			}).$mountTo(document.body);
		},
	},

	vuex: {
		actions: {
			updateStory,
		},
	},
});
