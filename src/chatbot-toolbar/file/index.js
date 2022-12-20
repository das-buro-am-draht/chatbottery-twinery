/*
Shows a quick search field, which changes passage highlights, and a button to
show the search modal dialog.
*/

import Vue from 'vue';
import locale from "../../locale";
import { prompt } from "../../dialogs/prompt";
import StatsDialog from "../../dialogs/story-stats";
import PluginDialog from "../../dialogs/plugin";
import UserDataDialog from "../../dialogs/user";
import FormatDialog from '../../dialogs/story-format';
import {proofStory} from '../../common/launch-story';

import './index.less';
import template from './index.html';

const File = Vue.extend({
	template,

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
		review(e) {
			proofStory(this.$store, this.story.id, this.proofingFormat.id);
		}
	},

	mounted: function () {
		this.$nextTick(function () {
			this.$data.proofingFormat = this.$store.state.storyFormat.formats.find(format => format.isReview);
		});
	},
});

export default File;
