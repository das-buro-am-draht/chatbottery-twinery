/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import locale from "../../locale";
import { prompt } from "../../dialogs/prompt";
import StatsDialog from "../../dialogs/story-stats";
import TrackingDialog from "../../dialogs/tracking";
// const FormatDialog = require('../../dialogs/story-format');
import FormatsDialog from "../../dialogs/formats";
// const ClickOutside = require('vue-click-outside');

import './index.less';
import template from './index.html';

const DropdownFile = Vue.extend({
	template,

	props: {
		story: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		active: false,
	}),

	computed: {
		updateStory () { return this.$store._actions.updateStory[0] },
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
			}).then((text) => this.updateStory({id: this.story.id, name: text }));
		},
		storyStats(e) {
			new StatsDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		tracking(e) {
			new TrackingDialog({
				data: { storyId: this.story.id, origin: e.target },
				store: this.$store,
			}).$mountTo(document.body);
		},
		changeFormat(e) {
			// new FormatDialog({
			// 	data: {storyId: this.story.id, origin: e.target},
			// 	store: this.$store
			// }).$mountTo(document.body);
			new FormatsDialog({
				store: this.$store,
				data: { origin: e.target },
			}).$mountTo(document.body);
		},
	},
});

export default DropdownFile;
