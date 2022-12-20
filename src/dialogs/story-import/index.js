/*
A dialog which allows a user to import a story from a file. This returns a
promise resolving to the stories that were imported, if any.
*/

import Vue from 'vue';
import semverUtils from 'semver-utils';

import importHTML from "../../data/import";
import load from "../../file/load";
import locale from "../../locale";
import notify from "../../ui/notify";
import { thenable } from "../../vue/mixins/thenable";
import { formatVersion } from "../../data/format-versions";
import ModalDialog from '../../ui/modal-dialog';

import template from './index.html';

const StoryImport = Vue.extend({
	template,

	data: () => ({
		/* A file to immediately import when mounted. */
		immediateImport: null,

		/*
		Current state of the operation:
		   * `waiting`: waiting for the user to select a file
		   * `working`: working without user input
		   * `choosing`: choosing which stories to import, when there are
		     duplicates
		*/
		status: "waiting",

		/* An array of objects to import. */

		toImport: [],

		/*
		An array of story names that already exist, and will be replaced in the
		import.
		*/

		dupeNames: [],

		/* The names that the user has selected to replace. */

		toReplace: [],
	}),

	computed: {
		deleteStory () { return this.$store._actions.deleteStory[0] },
		importStory () { return this.$store._actions.importStory[0] },
		createFormatFromUrl () { return this.$store._actions.createFormatFromUrl[0] },
		existingStories () { return this.$store.getters.existingStories },
		storyFormats () { return this.$store.getters.storyFormats },
		confirmClass() {
			if (this.toReplace.length === 0) {
				return "primary";
			}

			return "danger";
		},

		confirmLabel() {
			if (this.toReplace.length === 0) {
				return locale.say("Don't Replace Any Chatbots");
			}

			return locale.sayPlural(
				"Replace %d Chatbot",
				"Replace %d Chatbots",
				this.toReplace.length
			);
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			if (this.immediateImport) {
				this.import(this.immediateImport);
			}
		});
	},

	methods: {
		close() {
			if (this.$refs.modal) {
				this.$refs.modal.close();
			}
		},

		find(name) {
			const stories = this.existingStories;
			return stories.find(story => story.name === name);
		},

		_importStory(story) {
			return Promise.resolve(this.storyFormats).then(formats => {
				if (story.storyFormat === 'Chatbottery' && !formatVersion(formats, story.storyFormat, story.storyFormatVersion)) {
					const majorVersion = semverUtils.parse(story.storyFormatVersion).major;
					if (majorVersion) {
						return this.createFormatFromUrl(`https://web-runtime.chatbottery.com/editor/chatbotteryStoryFormat.v${majorVersion}.js`).then(() => {
							notify(locale.say(
								"Chatbottery format %s was loaded.",
								majorVersion
							));
						});
					}
				}
			}).then(() => {
				this.importStory(story);
				const importedStory = this.find(story.name);
				if (importedStory.storyFormat !== story.storyFormat || importedStory.storyFormatVersion !== story.storyFormatVersion) {
					notify(locale.say(
						"Story format of imported story was changed to '%s'.",
						importedStory.storyFormat + ' ' + importedStory.storyFormatVersion)
					), 'danger';					
				}
			});
		},

		importChatFile(file) {
			this.status = "working";

			load(file).then((source) => {
				this.toImport = importHTML(source);

				this.dupeNames = this.toImport.reduce(
					(list, story) => {
						if (this.find(story.name)) {
							list.push(story.name);
						}
						return list;
					}, []);

				if (this.dupeNames.length > 0) {
					/* Ask the user to pick which ones to replace, if any. */

					this.status = "choosing";
				} else {
					/* Immediately run the import and close the dialog. */

					return Promise.all(this.toImport.map((story) => this._importStory(story)))
						.then(() => this.close());
				}
			});
		},

		replaceAndImport() {
			this.toReplace.forEach((name) => {
				this.deleteStory(this.find(name).id);
			});

			Promise.all(this.toImport.map((story) => {
				/*
				If the user *didn't* choose to replace this story, skip it.
				*/

				if (this.toReplace.indexOf(story.name) !== -1 || !this.find(story.name)) {
					return this._importStory(story);
				}				
			})).then(() => this.close());
		},
	},

	components: {
		"modal-dialog": ModalDialog,
	},

	mixins: [thenable],
});

export default StoryImport;
