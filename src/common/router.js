/* The router managing the app's views. */

let Vue = require('vue');
const VueRouter = require('vue-router');
const LocaleView = require('../locale/view');
const ChatbotView = require('../chatbot-view');
// const WelcomeView = require('../welcome');
const HomeView = require('../home');
const ChatbotsView = require('../chatbots');
const locale = require('../locale');
const { getStoryPlayHtml, getStoryProofingHtml, getStoryTestHtml } = require('./story-html');
const replaceUI = require('../ui/replace');

Vue.use(VueRouter);

let TwineRouter = new VueRouter();

TwineRouter.map({
	/*  We connect routes with no params directly to a component. */

	'/locale': {
		component: LocaleView
	},

	// '/welcome': {
	// 	component: WelcomeView
	// },

	'/home': {
		component: HomeView,
	},

	'/chatbots': {
		component: ChatbotsView,
	},

	/*
	For routes that take data objects, we create shim components which provide
	appropriate props to the components that do the actual work.
	*/
	'/chatbots/:id': {
		component: {
			template: '<chatbot-view :story-id="id"></chatbot-view>',

			components: {'chatbot-view': ChatbotView},

			data() {
				return {id: this.$route.params.id};
			},
		}
	},

	/*
	These routes require special handling, because we tear down our UI when
	they activate.
	*/

	'/chatbots/:id/play': {
		component: {
			ready() {
				getStoryPlayHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:id/proof': {
		component: {
			ready() {
				getStoryProofingHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:id/proof/:formatId': {
		component: {
			ready() {
				getStoryProofingHtml(this.$store, this.$route.params.id, this.$route.params.formatId)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:id/test': {
		component: {
			ready() {
				getStoryTestHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:storyId/test/:passageId': {
		component: {
			ready() {
				getStoryTestHtml(
					this.$store,
					this.$route.params.storyId,
					this.$route.params.passageId
				)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	}
});

/* By default, show the story list. */

TwineRouter.redirect({
	'*': '/home'
});

TwineRouter.beforeEach(transition => {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/
	const getStoryId = (path) => {
		const match = path.match(/^\/chatbots\/([^\/]+)$/i);
		if (match)
			return match[1];
	}

	if (transition.to.path) {
		const storyId = getStoryId(transition.to.path);
		if (storyId) {
			const store = transition.to.router.app.$store;
			if (!store.state.story.stories.some(story => story.id === storyId)) {
				return transition.redirect('/chatbots');
			}
		}
	}

	if (transition.from.path && transition.to.path === '/chatbots') {
		const editingId = getStoryId(transition.from.path);
		if (editingId) {
			transition.to.params.previouslyEditing = editingId;
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	// const welcomeSeen = store.state.pref.welcomeSeen;

	// if (transition.to.path === '/welcome' || welcomeSeen) {
		transition.next();
	// }
	// else {
		// transition.redirect('/welcome');
	// }
});

module.exports = TwineRouter;
