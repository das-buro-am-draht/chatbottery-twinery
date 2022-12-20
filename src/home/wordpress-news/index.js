// The side toolbar of a story list.

import Vue from 'vue';

import "./index.less";
import template from './index.html';

const HomeWordpressNews = Vue.extend({
	template,

	data: () => ({
		news: []
	}),

	computed: {
		appInfo () { return this.$store.getters.appInfo },
		existingStories () { return this.$store.getters.existingStories }
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
	},

	mounted: function () {
		this.$nextTick(function () {
			const self = this;
			const url =
				"https://chatbottery.com/wp-json/wp/v2/posts?categories=11&_embed&filter[orderby]=date&order=desc";

			fetch(url, { method: "GET" }).then((response) => {
				response
					.json()
					.then(data => {
						const news = data.map(({title: {rendered: title}, excerpt: {rendered: excerpt}, link, date: _date}) => {
							const date = self.transformDate(_date);
							const content = self.transformContent(excerpt)
							return {title, content, link, date};
						});
						self.news = news;
					});
			});
		});
	},
});

export default HomeWordpressNews;
