// The side toolbar of a story list.

const Vue = require("vue");
const { importStory } = require("../../data/actions/story");
const locale = require('../../locale');
const {prompt} = require('../../dialogs/prompt');
const ImportDialog = require('../../dialogs/story-import');
const {createStory} = require('../../data/actions/story');
const blankbot = require('../../common/Blankbot.html');
const importHTML = require('../../data/import');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyOrder: 'name',
		storyOrderDir: 'asc'
	}),

	computed: {
		sortedStories() {
			// debugger;
			/*
			If we have no stories to sort, don't worry about it.
			*/

			if (this.stories.length === 0) {
				return this.stories;
			}

			switch (this.storyOrder) {
				case 'name':
					return this.stories.sort((a, b) => {
						if (a.name > b.name) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (a.name < b.name) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				case 'lastUpdate':
					return this.stories.sort((a, b) => {
						const aTime = a.lastUpdate.getTime();
						const bTime = b.lastUpdate.getTime();

						if (aTime > bTime) {
							return this.storyOrderDir === 'asc' ? 1 : -1;
						}

						if (aTime < bTime) {
							return this.storyOrderDir === 'asc' ? -1 : 1;
						}

						return 0;
					});

				default:
					throw new Error(
						`Don't know how to sort by "${this.storyOrder}"`
					);
			}
		}
	},

	methods: {
		createStoryPrompt(e) {
			// Prompt for the new story name.

			prompt({
				message: locale.say(
					'What should your chatbot be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (
						this.stories.find(story => story.name === name)
					) {
						return locale.say(
							'A chatbot with this name already exists.'
						);
					}
				},

				origin: e.target
			}).then(name => {
				this.createStory({name});

				/* Allow the appearance animation to complete. */

				window.setTimeout(() => {
					this.$dispatch(
						'story-edit',
						this.stories.find(story => story.name === name)
							.id
					);
				}, 300);
			});
		},
		importFile(e) {
			new ImportDialog({
				store: this.$store,
				data: {origin: e.target}
			}).$mountTo(document.body);
		},
		importBlankbot() {
			const isBlankbot = this.stories.some(
				orig => orig.name === "Blankbot"
			);

			if (!isBlankbot) {
				const toImport = importHTML(blankbot) || [];
				toImport.forEach(story => this.importStory(story));
			}
		}
	},

	activate: function (done) {
		this.importBlankbot();

		done();
	},

	components: {
		'story-item': require('./story-item')
	},

	events: {
		'story-edit'(id) {
			this.$broadcast('story-edit', id);
		},
	},

	vuex: {
		actions: {
			createStory,
			importStory
		},

		getters: {
			stories: state => state.story.stories,
		},
	}
});
