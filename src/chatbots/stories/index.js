// The side toolbar of a story list.

const Vue = require("vue");
const { importStory } = require("../../data/actions/story");
const locale = require("../../locale");
const { prompt } = require("../../dialogs/prompt");
const ImportDialog = require("../../dialogs/story-import");
const { createStory } = require("../../data/actions/story");
const blankbotHtml = require('../../common/blankbot/Blankbot.html');
const {version: blankbotVersion} = require('../../common/blankbot/blankbot.json');
const importHTML = require("../../data/import");
const { deleteStory } = require("../../data/actions/story");

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyOrder: "name",
		storyOrderDir: "asc",
	}),

	computed: {
		sortedStories() {
			/*
			If we have no stories to sort, don't worry about it.
			*/

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case "name":
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return this.storyOrderDir === "asc" ? 1 : -1;
						}

						if (a.name < b.name) {
							return this.storyOrderDir === "asc" ? -1 : 1;
						}

						return 0;
					});

				case "lastUpdate":
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return this.storyOrderDir === "asc" ? 1 : -1;
						}

						if (aTime < bTime) {
							return this.storyOrderDir === "asc" ? -1 : 1;
						}

						return 0;
					});

				default:
					throw new Error(`Don't know how to sort by "${this.storyOrder}"`);
			}
		},
	},

	methods: {
		find(name) {
			const stories = this.stories;
			return stories.find(story => story.name === name);
		},

		createStoryPrompt(e) {
			// Prompt for the new story name.

			prompt({
				message: locale.say(
					"What should your chatbot be named?<br>(You can change this later.)"
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say("Add"),
				buttonClass: "create",
				validator: (name) => {
					if (this.stories.find((story) => story.name === name)) {
						return locale.say("A chatbot with this name already exists.");
					}
				},

				origin: e.target,
			}).then((name) => {
				this.createStory({ name });

				/* Allow the appearance animation to complete. */

				window.setTimeout(() => {
					this.$dispatch(
						"story-edit",
						this.stories.find((story) => story.name === name).id
					);
				}, 300);
			});
		},
		importFile(e) {
			new ImportDialog({
				store: this.$store,
				data: { origin: e.target },
			}).$mountTo(document.body);
		},
		importBlankbot() {
			const isBlankbot = this.stories.some((orig) => orig.name === "Blankbot");
			const importedBlankbotVersion = window.localStorage.getItem('blankbot-import-version');
			const isNewerBlankbot = blankbotVersion > importedBlankbotVersion;

			if (!isBlankbot || isNewerBlankbot) {
				isBlankbot && this.deleteStory(this.find("Blankbot").id);
				const toImport = importHTML(blankbotHtml) || [];

				window.localStorage.removeItem('blankbot-import-version');
				window.localStorage.setItem('blankbot-import-version', blankbotVersion);
				
				toImport.forEach(story => this.importStory(story));
			}
		},
	},

	ready: function () {
		this.importBlankbot();
	},

	components: {
		"story-item": require("./story"),
		'file-drag-n-drop': require('../../ui/file-drag-n-drop')
	},

	events: {
		"story-edit"(id) {
			this.$broadcast("story-edit", id);
		},
		'file-drag-n-drop'(files) {
			new ImportDialog({
				store: this.$store,
				data: {
					immediateImport: files[0]
				}
			}).$mountTo(document.body);
		}
	},

	vuex: {
		actions: {
			createStory,
			importStory,
			deleteStory,
		},

		getters: {
			stories: (state) => state.story.stories,
		},
	},
});
