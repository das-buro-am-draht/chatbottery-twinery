/*
A dialog which allows a user to import a story from a file. This returns a
promise resolving to the stories that were imported, if any.
*/

const Vue = require("vue");
const semverUtils = require('semver-utils');
const { deleteStory, importStory } = require("../../data/actions/story");
const { createFormatFromUrl } = require("../../data/actions/story-format");
const importData = require("../../data/import/import");
const load = require("../../file/load");
const locale = require("../../locale");
const notify = require("../../ui/notify");
const { thenable } = require("../../vue/mixins/thenable");
const { formatVersion } = require("../../data/format-versions");

module.exports = Vue.extend({
	template: require("./index.html"),

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

	ready() {
		if (this.immediateImport) {
			this.import(this.immediateImport);
		}
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
						importedStory.storyFormat + ' ' + importedStory.storyFormatVersion
					), 'danger');					
				}
			});
		},

		import(file) {
			this.status = "working";

			load(file).then((source) => {

				try {
					this.toImport = importData(source);
				} catch(e) {
					notify(locale.say(
						"Error on importing file '%1$s': %2$s",
						file.name, e.message
					), 'danger');
					return this.close();
				}

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
		"modal-dialog": require("../../ui/modal-dialog"),
	},

	mixins: [thenable],

	vuex: {
		actions: {
			deleteStory,
			importStory,
			createFormatFromUrl,
		},

		getters: {
			existingStories: (state) => state.story.stories,
			storyFormats: (state) => state.storyFormat.formats,			
		},
	},
});
