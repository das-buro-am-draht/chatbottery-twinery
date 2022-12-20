// The side toolbar of a story list.

import Vue from 'vue';
import locale  from "../../locale";
import { prompt } from "../../dialogs/prompt";
import HomeWordpressNews from "../wordpress-news";

import "./index.less";
import template from './index.html';

const HomeInfoContent = Vue.extend({
	template,

	computed: {
		createStory () { return this.$store._actions.createStory[0] },
		appInfo () { return this.$store.getters.appInfo },
		existingStories () {return this.$store.getters.existingStories }
	},

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
					'What should your chatbot be named?<br>(You can change this later.)'
				),
				buttonLabel: '<i class="fa fa-plus"></i> ' + locale.say('Add'),
				buttonClass: 'create',
				validator: name => {
					if (
						this.existingStories.find(story => story.name === name)
					) {
						return locale.say(
							'A chatbot with this name already exists.'
						);
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
		'wordpress-news': HomeWordpressNews,
	},

	events: {
		'story-edit'(id) {
			this.$root.$emit("story-edit", id); // TODO: check event
		},
	},
});

export default HomeInfoContent;
