/*
A modal which shows aggregrate statistics for a story.
*/

const Vue = require('vue');
const moment = require('moment');
const linkParser = require('../../data/link-parser');
const locale = require('../../locale');
const notify = require('../../ui/notify');
const { stringFromDate } = require('../../utils/common');
const { proxy } = require('../../utils/proxy');

require('./index.less');

const UNMATCHED_PASSAGE = "UNMATCHED";

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: '',
		origin: null,
		matomo: {
			from: stringFromDate(new Date(Date.now() - 864000000)), // 10 days
			to: stringFromDate(new Date()),
			items: null,
		},
	}),

	ready() {
		this.loadMatomo();
	},

	methods: {
		loadMatomo() {
			const story = this.allStories.find(story => story.id === this.storyId);
			const matomo = story.plugins.matomo;
			if (matomo && matomo.url && matomo.authToken) {
				const url = matomo.url.replace(/(\S+\/)(\S+\.php\/?)?$/i, '$1');
				if (url) {
					const params = {
						token_auth: matomo.authToken,
						module: 'API',
						method: 'Events.getAction',
						idSite: matomo.siteId,
						period: 'range',
						date: new Date(this.matomo.from).toISOString().slice(0, 10) + ','
								+ new Date(this.matomo.to).toISOString().slice(0, 10),
						format: 'JSON',
						segment: 'eventAction==' + UNMATCHED_PASSAGE,
						// filter_limit: 1,
						expanded: 1,
					};
					const queryString = Object.keys(params).map((key) => 
						encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
					).join('&');
					const requestUrl = proxy.fetch() + '&url=' + encodeURIComponent(`${url}?${queryString}`);
					fetch(requestUrl)
						.then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP-Status: ${response.status}`);
							}
							return response.json();
						})
						.then((data) => {
							const unmatched = data.find((item) => item.label === UNMATCHED_PASSAGE);
							this.matomo.items = unmatched ? (unmatched.subtable || [])
									.map((entry) => ({label: entry.label, events: entry.nb_events}))
									.sort((a, b) => b.events - a.events) : [];
						})
						.catch((error) => {
							notify(locale.say(`Error on loading Matomo data from '${url}: ${error.message}`), 'danger');
						});
				}
			}
		},
	},

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		lastUpdate() {
			return moment(this.story.lastUpdate).format('LLLL');
		},

		charCount() {
			return this.story.passages.reduce(
				(count, passage) => count + passage.text.length,
				0
			);
		},

		charDesc() {
			/*
			L10n: Character in the sense of individual letters in a word.  This
			does not actually include the count, as it is used in a table.
			*/
			return locale.sayPlural('Character', 'Characters', this.charCount);
		},

		wordCount() {
			return this.story.passages.reduce(
				(count, passage) => count + passage.text.split(/\s+/).length,
				0
			);
		},

		wordDesc() {
			/*
			L10n: Word in the sense of individual words in a sentence.  This
			does not actually include the count, as it is used in a table.
			*/
			return locale.sayPlural('Word', 'Words', this.wordCount);
		},

		links() {
			/* An array of distinct link names. */

			return this.story.passages.reduce(
				(links, passage) => [
					...links,
					...linkParser.links(passage.text).filter(
						link => links.indexOf(link) === -1
					)
				],
				[]
			);
		},

		passageNames() {
			return this.story.passages.map(passage => passage.name);
		},

		passageCount() {
			return this.story.passages.length;
		},

		passageDesc() {
			/*
			L10n: Word in the sense of individual words in a sentence.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural('Passage', 'Passages', this.passageCount);
		},

		linkCount() {
			/* This counts repeated links, unlike links(). */

			return this.story.passages.reduce(
				(count, passage) => count + linkParser.links(passage.text).length,
				0
			);
		},
		
		linkDesc() {
			/*
			L10n: Links in the sense of hypertext links.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural('Link', 'Links', this.linkCount);
		},

		brokenLinkCount() {
			return this.links.filter(
				link => this.passageNames.indexOf(link) === -1
			).length;
		},

		brokenLinkDesc() {
			/*
			L10n: Links in the sense of hypertext links.
			This does not actually include the count, as it is used in a
			table.
			*/
			return locale.sayPlural(
				'Broken Link',
				'Broken Links',
				this.brokenLinkCount
			);
		}
	},

	vuex: {
		getters: {
			allStories: state => state.story.stories
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});
