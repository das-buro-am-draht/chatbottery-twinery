// The side toolbar of a story list.

import Vue from 'vue';

import locale from "../../locale";
import { prompt } from "../../dialogs/prompt";
import ImportDialog from "../../dialogs/story-import";
import blankbotHtml from '../../common/blankbot/Blankbot.html';
import { version as blankbotVersion } from '../../common/blankbot/blankbot.json';
import importHTML from "../../data/import";
import StoryItem from "./story";
import FileDragNDrop from '../../ui/file-drag-n-drop';

import './index.less';
import template from './index.html';

const ChatbotsContent = Vue.extend({
	template,

	data: () => ({
		storyOrder: "name",
		storyOrderDir: "asc",
	}),

	computed: {
		createStory () { return this.$store._actions.createStory[0] },
		deleteStory () { return this.$store._actions.deleteStory[0] },
		importStory () { return this.$store._actions.importStory[0] },
		stories () { return this.$store.getters.stories },
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
					// TODO: check $dispatch
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

	mounted: function () {
		this.$nextTick(function () {
			this.importBlankbot();
		});
	},

	components: {
		"story-item": StoryItem,
		'file-drag-n-drop': FileDragNDrop
	},

	events: {
		"story-edit"(id) {
			this.$broadcast("story-edit", id); // TODO: check broadcast
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
});

export default ChatbotsContent;
