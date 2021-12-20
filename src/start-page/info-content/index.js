// The side toolbar of a story list.

const Vue = require("vue");
const { importStory } = require("../../data/actions/story");
const locale = require('../../locale');
const {prompt} = require('../../dialogs/prompt');
const {createStory} = require('../../data/actions/story');
const blankbot = require('../../common/Blankbot.html');
const importHTML = require('../../data/import');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		news: []
	}),

	methods: {
		openRedirect(url) {
			window.open(url, "_blank") || window.location.replace(url);
		},
		transformDate(_date) {
			const date = new Date(_date);
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();
			return `${day}.${month}.${year}`;
		},
		transformContent(_content) {
			return _content.replace( /(<([^>]+)>)/ig, '').trim()
		},
		createStoryPrompt(e) {
			// Prompt for the new story name.
			console.log(0)

			prompt({
				message: locale.say(
					'What should your story be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (
						this.existingStories.find(story => story.name === name)
					) {
						return locale.say(
							'A story with this name already exists.'
						);
					}
				},

				origin: e.target
			}).then(name => {
				console.log('createStory', this);
				this.createStory({name});

				/* Allow the appearance animation to complete. */

				window.setTimeout(() => {
					console.log('dispatch', this, this.$dispatch);
					this.$dispatch(
						'story-edit',
						this.existingStories.find(story => story.name === name)
							.id
					);
				}, 300);
			});
		},
		importBlankbot() {
			const isBlankbot = this.existingStories.some(
				orig => orig.name === "Blankbot"
			);

			if (!isBlankbot) {
				const toImport = importHTML(blankbot) || [];
				toImport.forEach(story => this.importStory(story));
			}
		}
	},

	activate: async function (done) {
		const self = this;
		const url =
			"https://chatbottery.com/wp-json/wp/v2/posts?categories=11&_embed&filter[orderby]=date&order=desc";

		await fetch(url, { method: "GET" }).then((response) => {
			response
				.json()
				.then(data => {
					const news = data.map(({title: {rendered: title}, excerpt: {rendered: excerpt}, link, date: _date}) => {
						const date = self.transformDate(_date);
						const content = self.transformContent(excerpt);
						return {title, content, link, date};
					});
					self.news = news;
				});
		});

		await this.importBlankbot();

		done();
	},

	components: {},

	events: {
		'story-edit'(id) {
			console.log('story-edit', this.$broadcast);
			this.$broadcast('story-edit', id);
		},
	},

	vuex: {
		actions: {
			createStory,
			importStory
		},

		getters: {
			appInfo: state => state.appInfo,
			existingStories: state => state.story.stories
		}
	},
});
