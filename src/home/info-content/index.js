// The side toolbar of a story list.

const Vue = require("vue");
const locale = require('../../locale');
const {prompt} = require('../../dialogs/prompt');
const {createStory} = require('../../data/actions/story');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({}),

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
			return _content.replace( /(<([^>]+)>)/ig, '').trim();
		},
		createStoryPrompt(e) {
			// Prompt for the new story name.

			prompt({
				message: locale.say(
					'How should your chatbot be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (this.existingStories.find(story => story.name === name)) {
						return locale.say('A chatbot with this name already exists.');
					}
				},

				origin: e.target
			}).then(name => {
				this.createStory({name});
				const id = this.existingStories.find(story => story.name === name)
				.id;

				window.location.replace(`#!/chatbots/${id}`);

				

				/* Allow the appearance animation to complete. */

				// window.setTimeout(() => {
				// 	this.$dispatch(
				// 		'story-edit',
				// 		this.existingStories.find(story => story.name === name)
				// 			.id
				// 	);
				// }, 300);
			});
		}
	},

	components: {
		'wordpress-news': require('../wordpress-news'),
	},

	events: {
		'story-edit'(id) {
			this.$broadcast('story-edit', id);
		},
	},

	vuex: {
		actions: {
			createStory
		},

		getters: {
			appInfo: state => state.appInfo,
			existingStories: state => state.story.stories,
		}
	},
});
