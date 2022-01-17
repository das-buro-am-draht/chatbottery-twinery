// The side toolbar of a story list.

const Vue = require("vue");

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
	},

	activate: function (done) {
		const self = this;
		const url =
			"https://chatbottery.com/wp-json/wp/v2/posts?categories=11&_embed&filter[orderby]=date&order=desc";

		fetch(url, { method: "GET" }).then((response) => {
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
		})
		.then(() => done());
	},

	components: {},

	events: {},

	vuex: {
		actions: {},

		getters: {
			appInfo: state => state.appInfo,
			existingStories: state => state.story.stories
		}
	},
});
