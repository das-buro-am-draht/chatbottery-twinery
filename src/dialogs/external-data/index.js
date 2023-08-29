// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const { updateStory } = require("../../data/actions/story");
const { 
	trim, 
	isValidUrl 
} = require("../../utils/common");
const locale = require("../../locale");
const notify = require("../../ui/notify");
const { pageAnalysis } = require('../../common/app/openai');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		origin: null,
		data: [],
		list: -1,
		selection: -1,
		processing: false,
	}),

	ready() {
		const story = this.story;
		if (story.externalData) {
			this.data = story.externalData.map((data) => ({
				name: data.name,
				items: data.items.map((item) => ({...this.newItem, ...item}))
			})); 
		}
		if (!this.data.length) {
			this.onAddList();
		}
		this.onSelectList(0);
	},

	computed: {
		story() {
			return this.allStories.find((story) => story.id === this.storyId);
		},

		newItem() {
			return {
				processed: null,
				url: '',
				title: '',
				author: '',
				date: '',
				phrases: [],
				main_keyword: '',
				keywords: [],
				image_url: '',
				summary: '',
				keywords_custom: '',
				summary_custom: '',
				error: '',
			};
		},

		valid() {
			return this.data.map((list) => ({ 
				...list,
				items: list.items
					.filter((item) => !!trim(item.url))
					.map((item) => ({ ...item, error: undefined })),
			})).filter((list) => list.items.length > 0);
		},

		processed() {
			return this.valid.reduce((prev, list) => prev.concat(list.items), []).filter((entry) => entry.processed != null);
		},
	},

	methods: {
		dragList(index, event) {
			const data = [this._uid, index].join();
			event.dataTransfer.setData('cb/ed-list', data);
		},		
		dragenterList(event) {
			if (event.dataTransfer.types.includes('cb/ed-list')) {
				event.preventDefault(); // is allowed
			}
		},
		dropList(index, event) {
			const toIdx = index;
			const [_uid, ix] = event.dataTransfer.getData('cb/ed-list').split(',');
			event.dataTransfer.clearData('cb/ed-list');
			if (parseInt(_uid) !== this._uid) {
				return; // don't allow other components
			}
			const fromIdx = parseInt(ix);
			if (!isNaN(fromIdx) && toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.data.length) {
				const data = [ ...this.data ];
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				data.splice(insertIdx, 0, data[fromIdx]);
				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				data.splice(removeIdx, 1);
				this.data = data;

				this.onSelectList(toIdx);
			}
		},
		
		onSelectList(index) {
			this.list = index;
			this.selection = -1;
		},

		onDeleteList(index) {
			this.data.splice(index, 1);
			if (this.list >= this.data.length) {
				this.onSelectList(this.list - 1);
			}
		},

		onAddList() {
			this.data.push({
				name: '',
				items: [ { ...this.newItem } ],
			});
			this.onSelectList(this.data.length - 1);
		},

		dragItem(index, event) {
			const data = [this._uid, index].join();
			event.dataTransfer.setData('cb/ed-items', data);
		},		
		dragenterItem(event) {
			if (event.dataTransfer.types.includes('cb/ed-items')) {
				event.preventDefault(); // is allowed
			}
		},
		dropItem(index, event) {
			const toIdx = index;
			const [_uid, ix] = event.dataTransfer.getData('cb/ed-items').split(',');
			event.dataTransfer.clearData('cb/ed-items');
			if (parseInt(_uid) !== this._uid) {
				return; // don't allow other components
			}
			const fromIdx = parseInt(ix);
			if (!isNaN(fromIdx) && toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.data[this.list].items.length) {
				const items = [ ...this.data[this.list].items ];
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				items.splice(insertIdx, 0, items[fromIdx]);
				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				items.splice(removeIdx, 1);
				this.data[this.list].items = items;
			}
		},

		onSelectItem(index) {
			this.selection = this.selection === index ? -1 : index;
		},

		onDeleteItem(index) {
			this.selection = -1;
			this.data[this.list].items.splice(index, 1);
		},

		onProcessItem(index) {
			this.onSelectItem(index);
			this.processing = true;
			const item = this.data[this.list].items[index];
			item.error = '';
			const url = item.url;
			fetch(url, { 
				method: 'GET',
				headers: {
					Accept: 'text/html',
				},
				cache: 'no-cache',
			})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Error on calling '${url} - HTTP-Status: ${response.status}`);
				}
				return response.text();
			})
			.then((html) => pageAnalysis(this.openaiPage, html))
			.then((json) => {
				item.title = json.title || '';
				item.author = json.author || '';
				item.date = json.date || '';
				item.phrases = json.phrases || [];
				item.main_keyword = json.main_keyword || '';
				item.keywords = json.keywords || [];
				item.image_url = json.image_url || '';
				item.summary = json.summary || '';
				item.processed = Date.now();			
			})
			.catch((error) => {
				item.error = error.message;
				notify(
					locale.say(
						'Error on analysing URL &ldquo;%1$s&rdquo; - %2$s.',
						item.url,
						error.message
					),
					'danger'
				);
				this.selection = -1;
			})
			.finally(() => this.processing = false);
		},
		
		onAddEntry() {
			const index = this.data[this.list].items.length;
			this.data[this.list].items.push({ ...this.newItem });
			Vue.nextTick(() => {
				this.$refs.modal.$el.querySelectorAll('.externaldata-item')[index].scrollIntoView({block: 'nearest', behavior: 'smooth'});
			});
		},

		isValid(item) {
			return isValidUrl(item.url);
		},

		save() {
			const externalData = this.valid;
			this.updateStory(this.storyId, { 
				externalData: externalData.length > 0 ? externalData : undefined
			});
			this.$refs.modal.close();
		},
	},

	events: {
	},

	vuex: {
		actions: {
			updateStory,
		},

		getters: {
			allStories: (state) => state.story.stories,
			openaiPage: (state) => state.pref.openaiPage,
		},
	},

	components: {
		"modal-dialog": require("../../ui/modal-dialog"),
	},

});
