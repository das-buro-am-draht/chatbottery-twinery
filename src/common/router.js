/* The router managing the app's views. */

import Vue from 'vue';
import VueRouter from "vue-router";
import LocaleView from "../locale/view";
import ChatbotEditView from "../chatbot-view";
import HomeView from "../home";
import ChatbotsView from "../chatbots";
import locale from "../locale";
import {getStoryPlayHtml,
	getStoryProofingHtml,
	getStoryTestHtml} from "./story-html";
import replaceUI from "../ui/replace";

Vue.use(VueRouter);

const routes = [
    {path: "*", redirect: "/home"},
    /*  We connect routes with no params directly to a component. */
	{path: "/locale", component: LocaleView},
	{
        path: "/home",
		component: HomeView,
	},
	{
        path: "/chatbots",
		component: ChatbotsView,
	},
	{
        path: "/chatbots/:id",
		component: {
			template: '<div><story-edit :story-id="id"></story-edit></div>',

			components: { "story-edit": ChatbotEditView },

			data() {
				return { id: this.$route.params.id };
			},
		},
	},
	/*
	These routes require special handling, because we tear down our UI when
	they activate.
	*/
	{
        path: "/chatbots/:id/play",
		component: {
			mounted: function () {
				this.$nextTick(function () {
					getStoryPlayHtml(this.$store, this.$route.params.id)
						.then(replaceUI)
						.catch((e) => {
							window.alert(
								locale.say(
									"An error occurred while publishing your chatbot. (%s)",
									e.message
								)
							);

							/* Force returning to the previous view. */

							throw e;
						});
				});
			},
		},
	},
	{
        path: "/chatbots/:id/proof",
		component: {
			mounted: function () {
				this.$nextTick(function () {
					getStoryProofingHtml(this.$store, this.$route.params.id)
						.then(replaceUI)
						.catch((e) => {
							window.alert(
								locale.say(
									"An error occurred while publishing your chatbot. (%s)",
									e.message
								)
							);

							/* Force returning to the previous view. */

							throw e;
						});
				});
			},
		},
	},
	{
		path: "/chatbots/:id/proof/:formatId",
		component: {
			mounted: function () {
				this.$nextTick(function () {
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
				});
			}
		}
	},
	{
        path: "/chatbots/:id/test",
		component: {
			mounted: function () {
				this.$nextTick(function () {
					getStoryTestHtml(this.$store, this.$route.params.id)
						.then(replaceUI)
						.catch((e) => {
							window.alert(
								locale.say(
									"An error occurred while publishing your chatbot. (%s)",
									e.message
								)
							);

							/* Force returning to the previous view. */

							throw e;
						});
				});
			},
		},
	},
	{
        path: "/chatbots/:storyId/test/:passageId",
		component: {
			mounted: function () {
				this.$nextTick(function () {
					getStoryTestHtml(
						this.$store,
						this.$route.params.storyId,
						this.$route.params.passageId
					)
						.then(replaceUI)
						.catch((e) => {
							window.alert(
								locale.say(
									"An error occurred while publishing your chatbot. (%s)",
									e.message
								)
							);

							/* Force returning to the previous view. */

							throw e;
						});
				});
			},
		},
	},
];

const router = new VueRouter({
    routes
});

/* By default, show the story list. */

router.redirect({
	'*': '/home'
});

router.beforeEach((to, from, next) => {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/

	if (from.path && to.path === '/chatbots') {
		const editingId =
			from.path.match('^/chatbots/([^\/]+)$');

		if (editingId) {
			to.params.previouslyEditing = editingId[1];
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	// const welcomeSeen = store.state.pref.welcomeSeen;

	// if (transition.to.path === '/welcome' || welcomeSeen) {
		next();
	// }
	// else {
		// transition.redirect('/welcome');
	// }
});

export default router;
