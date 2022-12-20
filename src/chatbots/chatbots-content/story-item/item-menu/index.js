// Handles the cog menu for a single story.

const escape = require('lodash.escape');
import Vue from 'vue';
const {confirm} = require('../../../../dialogs/confirm');
const {
	deleteStory,
	duplicateStory,
	updateStory
} = require('../../../../data/actions/story');
import { mapActions } from 'vuex';
const {loadFormat} = require('../../../../data/actions/story-format');
const {playStory, testStory} = require('../../../../common/launch-story');
const {prompt} = require('../../../../dialogs/prompt');
const locale = require('../../../../locale');
const {publishStoryWithFormat} = require('../../../../data/publish');
const save = require('../../../../file/save');
import DropDown from '../../../../ui/drop-down';

import template from './index.html';

const ItemMenu = Vue.extend({
	template,

	props: {
		story: {
			type: Object,
			required: true
		}
	},

	components: {
		'drop-down': DropDown
	},

	computed: {
		deleteStory () { return this.$store._actions.deleteStory[0] },
		duplicateStory () { return this.$store._actions.duplicateStory[0] },
		updateStory () { return this.$store._actions.updateStory[0] },
		loadFormat () { return this.$store._actions.loadFormat[0] },
		appInfo () { return this.$store.getters.appInfo },
	},

	methods: {
		/**
		 Plays this story in a new tab.

		 @method play
		**/

		play() {
			playStory(this.$store, this.story.id);
		},

		/**
		 Tests this story in a new tab.

		 @method test
		**/

		// test() {
		// 	testStory(this.story.id);
		// },

		/**
		 Downloads the story to a file.

		 @method publish
		**/

		publish() {
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

		/**
		 Shows a confirmation before deleting the model.

		 @method confirmDelete
		**/

		deleteChatbot() {
			confirm({
				message: locale.say(
					'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
						'This cannot be undone.',
					escape(this.story.name)
				),
				buttonLabel:
					'<i class="fa fa-trash-o"></i> ' +
					locale.say('Delete Forever'),
				buttonClass: 'danger'
			}).then(() => {return this.deleteStory(this.story.id)});
		},

		/**
		 Prompts the user for a new name for the story, then saves it.

		 @method rename
		**/

		rename() {
			prompt({
				message: locale.say(
					'What should &ldquo;%s&rdquo; be renamed to?',
					escape(this.story.name)
				),
				buttonLabel: '<i class="fa fa-ok"></i> ' + locale.say('Rename'),
				response: this.story.name,
				blankTextError: locale.say('Please enter a name.')
			}).then(name => this.updateStory({id: this.story.id, name}));
		},

		/**
		 Prompts the user for a name, then creates a duplicate version of this
		 story accordingly.
		**/

		duplicate() {
			prompt({
				message: locale.say('What should the duplicate be named?'),
				buttonLabel:
					'<i class="fa fa-copy"></i> ' + locale.say('Duplicate'),
				response: locale.say('%s Copy', this.story.name),
				blankTextError: locale.say('Please enter a name.')
			}).then(name => {
				this.duplicateStory({id: this.story.id, name});
			});
		}
	},
});

export default ItemMenu;
