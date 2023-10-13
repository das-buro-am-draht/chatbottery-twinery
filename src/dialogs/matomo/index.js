/*
A modal which shows aggregrate statistics for a story.
*/

const Vue = require('vue');
const locale = require('../../locale');
const notify = require('../../ui/notify');
const { stringFromDate, queryParams } = require('../../utils/common');
const { proxy } = require('../../utils/proxy');
const PassageEditor = require("../../editors/passage");
const specialPassages = require('../../data/special-passages');
const { createNewlyLinkedPassages } = require('../../data/actions/passage');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: '',
		origin: null,
		date: {
			from: stringFromDate(new Date(Date.now() - 864000000)), // 10 days
			to: stringFromDate(new Date()),
		},
		visits: null,
		items: [[],[],[]],
		tab: 0,
		processing: false,
	}),

	ready() {
		this.loadMatomo();
	},

	computed: {
		story() {
			return this.allStories.find(story => story.id === this.storyId);
		},

		label() {
			switch (this.tab) {
				case 0: return 'This list shows the user phrases that couldn\'t be resolved.';
				case 1: return 'This list shows the user phrases that let to different passage suggestions.';
				case 2: return 'This list shows the names of passages and the count of invocations.';
			}
		},

		labelVisits() {
			return (this.visits.nb_uniq_visitors !== undefined ? 'Users' : 'Visits') + ' in total';
		},

		totalVisits() {
			return this.visits.nb_uniq_visitors !== undefined ? this.visits.nb_uniq_visitors : this.visits.nb_visits;
		},

		timePerVisit() {
			if (this.visits.avg_time_on_site) {
				return this.visits.avg_time_on_site;
			} else if (this.visits.sum_visit_length && this.visits.nb_visits > 0) {
				return Math.floor(this.visits.sum_visit_length / this.visits.nb_visits);
			} else {
				return '';
			}
		},

		actionsPerVisit() {
			if (this.visits.nb_actions_per_visit !== undefined) {
				return this.visits.nb_actions_per_visit;
			} else if (this.visits.nb_actions && this.visits.nb_visits > 0) {
				return Math.round(((this.visits.nb_actions / this.visits.nb_visits) * 100) / 100);
			} else {
				return '';
			}
		},

		passagesVisited() {
			const passages = this.story.passages.length;
			if (!passages) {
				return '';
			} else {
				return Math.floor((this.items[2].reduce((prev, item) => {
					if (item.events > 0) {
						prev += 1;
					}
					return prev;
				}, 0) / passages) * 100) + '%';
			}
		},
	},

	methods: {
		loadMatomo() {
			const { matomo } = this.story.plugins;
			if (matomo && matomo.url && matomo.authToken) {
				const url = matomo.url.replace(/(\S+\/)(\S+\.php\/?)?$/i, '$1');
				if (url) {
					const date = new Date(this.date.from).toISOString().slice(0, 10) + ',' +
					             new Date(this.date.to  ).toISOString().slice(0, 10);
					const urls = [
						{
							method: 'VisitsSummary.get',
							idSite: matomo.siteId,
							period: 'range',
							date,
						},
						{
							method: 'Events.getAction',
							idSite: matomo.siteId,
							period: 'range',
							date,
							expanded: 1,
						},
					]
					const params = {
						token_auth: matomo.authToken,
						module: 'API',
						method: 'API.getBulkRequest',
						format: 'JSON',
						'urls[0]': queryParams(urls[0]),
						'urls[1]': queryParams(urls[1]),
					};
					const queryString = queryParams(params);
					const requestUrl = proxy.fetch() + '&url=' + encodeURIComponent(`${url}?${queryString}`);
					this.processing = true;
					fetch(requestUrl)
						.then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP-Status: ${response.status}`);
							}
							return response.json();
						})
						.then(([visits, events]) => {
							const items = [[],[],[]];
							items[2] = this.story.passages.map((passage) => ({label: passage.name, events: 0}));
							events.forEach((item) => {
								switch (item.label) {
									case specialPassages.unmatched:
										items[0] = (item.subtable || []).map((entry) => ({label: entry.label, events: entry.nb_events}));
										break;
									case specialPassages.choosePassage:
										items[1] = (item.subtable || []).map((entry) => ({label: entry.label, events: entry.nb_events}));
										break;
									default:
										const entry = items[2].find((passage) => passage.label === item.label);
										if (entry) {
											entry.events += item.nb_events;
										} else {
											items[2].push({label: item.label, events: item.nb_events});
										}										
										break;
								}
							});
							this.visits = visits;
							this.items = items.map((list) => list = list.sort((a, b) => 
							b.events !== a.events ? b.events - a.events : String(a.label).localeCompare(b.label)
							));
						})
						.catch((error) => {
							notify(locale.say(`Error on loading Matomo data from '${url}: ${error.message}`), 'danger');
						})
						.finally(() => this.processing = false);
				}
			}
		},
		onItemClicked(passageName) {
			const story = this.story;
			const passage = story.passages.find(passage => passageName === passage.name);
			if (!passage) {
				console.error(`Passage: ${passageName} not found.`);
				return;
			}
			const oldText = passage.text;
			const afterEdit = () => {
				if (this.$refs.modal && this.$refs.modal.$els.dlg) {
					this.$refs.modal.$els.dlg.focus();
				}
				this.createNewlyLinkedPassages(
					story.id,
					passage.id,
					oldText,
					this.gridSize
				);
			};
			new PassageEditor({
				data: {
					passageId: passage.id,
					storyId: story.id,
				},
				store: this.$store,
				storyFormat: {
					name: story.storyFormat,
					version: story.storyFormatVersion
				}
			})
			.$mountTo(document.body)
			.then(afterEdit)
			.catch(afterEdit);
		},
	},

	vuex: {
		actions: {
			createNewlyLinkedPassages,
		},
		getters: {
			allStories: state => state.story.stories
		}
	},

	components: {
		'modal-dialog': require('../../ui/modal-dialog')
	}
});
