// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const uuid = require('tiny-uuid');
const { updateStory } = require("../../data/actions/story");
const { 
	trim, 
	isValidUrl ,
} = require("../../utils/common");
const save = require('../../file/save');
const { confirm } = require('../../dialogs/confirm');
const locale = require("../../locale");
const notify = require("../../ui/notify");
const { pageAnalysis } = require('../../common/app/openai');
const SettingsDialog = require("../settings");

require("./index.less");

const listInputSelector = '.externaldata-list--text > input';
const toString = (obj) => Array.isArray(obj) ? obj.join(', ') : obj;

module.exports = Vue.extend({
	template: require("./index.html"),

	data: () => ({
		storyId: null,
		origin: null,
		data: [],
		list: -1,
		selection: -1,
		processing: false,
		modified: false,
	}),

	ready() {
		const story = this.story;
		if (story.externalData) {
			this.data = story.externalData.map((data) => ({
				name: data.name,
				items: data.items.map((item) => ({
					...this.newItem, 
					...item,
					keywords: (item.keywords || '').toString(),
					phrases: (item.phrases || '').toString(),
				}))
			})); 
		}
		if (!this.data.length) {
			this.onAddList();
		}
		this.onSelectList(0);
		Vue.nextTick(() => this.$refs.modal.$el.querySelectorAll(listInputSelector).forEach((element) => this.calcListInput(element)));
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
				phrases: '',
				main_keyword: '',
				keywords: '',
				image_url: '',
				summary: '',
				error: '',
			};
		},

		canAnalyse() {
			return this.data[this.list].items.filter((item) => this.canProcess(item)).length > 0;
		},

		processed() {
			const processed = this.data.reduce((items, list) => {
				return items.concat(list.items.filter((item) => item.processed))
			}, []);
			return processed;
		},
	},

	methods: {
		onSettings(event) {
			new SettingsDialog({
				data: { storyId: this.storyId, origin: event.target },
				store: this.$store,
			}).$mountTo(document.body);

		},

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
				this.modified = true;
			}
		},

		listPlaceholder(index) {
			return 'List ' + (index + 1);
		},

		calcListInput(element) {
			element.style.width = element.value ? element.value.length + 'ch' : '40px';
		},

		onChangeList(index, event) {
			this.calcListInput(event.target);
			this.modified = true;
		},
		
		onSelectList(index) {
			this.selection = -1;
			this.list = index;
		},

		onDeleteList(index) {
			Promise.resolve(this.data[index].items.some((item) => !!item.processed)).then((processed) => {
				if (processed) {
					return confirm({
						message: locale.say('Are you sure you want to delete the entire list that contains entries that were previously analyzed?'),
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete list'),
						buttonClass: 'danger'
					}).then(() => this.modified = true);
				}
			}).then(() => {
				if (this.data[index].name || this.data[index].items.some((item) => !!item.url)) {
					this.modified = true;
				}
				this.data.splice(index, 1);
				if (this.list >= this.data.length) {
					this.onSelectList(this.list - 1);
				}
			});
		},

		onAddList() {
			this.selection = -1;
			this.data.push({
				name: '',
				items: [ { ...this.newItem } ],
			});
			const index = this.data.length - 1;
			this.onSelectList(index);
			Vue.nextTick(() => this.calcListInput(this.$refs.modal.$el.querySelectorAll(listInputSelector)[index]));

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
				this.selection = -1;
				this.data[this.list].items = items;
				this.modified = true;
			}
		},

		processItemTitle(item, index) {
			let title;
			if (!item.processed) {
				title = item.error ? item.error : 'Analyse URL';
			} else {
				title = 'Last analysed: ' + locale.date(item.processed, 'LLL');
			}
			if (this.selection === index) {
				title += ' - click to analyse again';
			}
			return title;
		},

		onSelectItem(index) {
			if (index !== this.selection) {
				this.selection = index;
				if (index >= 0) {
					const element = this.getListElement(index);
					if (element) {
						this.getListElement(index).scrollIntoView({block: 'nearest', behavior: 'smooth'});
					}
				}
			}
		},

		onCloseDetail() {
			if (this.processing) {
				confirm({
					message: locale.say('Are you sure you want to abort the analysis process?'),
					cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Continue')),
					buttonLabel: '<i class="fa fa-hand-stop-o"></i> ' + locale.say('Abort'),
					buttonClass: 'danger'
				}).then((result) => {
					if (result) {
						this.processing = false;
						notify(locale.say('The analysing process was aborted.'), 'info');
					}
				});
			} else {
				this.onSelectItem(-1);
			}
		},

		onDeleteItem(index) {
			const item = this.data[this.list].items[index];
			Promise.resolve(item.processed).then((processed) => {
				if (processed) {
					return confirm({
						message: locale.say('Are you sure you want to delete the entry that was previously analyzed?'),
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete entry'),
						buttonClass: 'danger'
					}).then(() => this.modified = true);
				}
			}).then(() => {
				this.selection = -1;
				if (!!item.url) {
					this.modified = true;
				}
				this.data[this.list].items.splice(index, 1);
			});
		},

		onProcessItem(index) {
			const item = this.data[this.list].items[index];
			const selection = this.selection;
			this.onSelectItem(index);
			if (selection === index || !(item.processed || item.error)) {
				this.processing = true;
				this.analyzeItem(item).finally(() => this.processing = false);
			}
		},

		onProcessAll() {
			this.processing = true;
			this.data[this.list].items
				.map((item, index) => ([item, index]))
				.filter(([item]) => this.canProcess(item))
				.reduce((promise, [item, index]) => {
					return promise.then((abort) => {
						if (abort || !this.processing) {
							return true;
						}
						this.onSelectItem(index);
						return this.analyzeItem(item).then(() => false);
					});
				}, Promise.resolve(false))
				.finally(() => {
					this.processing = false;
				});
		},
		
		onAddEntry() {
			const index = this.data[this.list].items.length;
			this.data[this.list].items.push({ ...this.newItem });
			Vue.nextTick(() => {
				const element = this.getListElement(index);
				if (element) {
					element.scrollIntoView({block: 'nearest', behavior: 'smooth'});
					element.querySelector('.externaldata-item--input input').focus();
				}
			});
		},

		analyzeItem(item) {
			item.error = '';
			return pageAnalysis(this.openaiPage, item.url)
				.then((json) => {
					item.title = json.title || '';
					item.author = json.author || '';
					item.date = json.date || '';
					item.phrases = toString(json.phrases || '');
					item.main_keyword = json.main_keyword || '';
					item.keywords = toString(json.keywords || '');
					item.image_url = json.image_url || '';
					item.summary = json.summary || '';
					item.processed = Date.now();	
					this.modified = true;	
				}) 
				.catch((error) => {
					item.error = error.message;
					notify(
						locale.say(
							'Error on analysing URL &ldquo;%1$s&rdquo; - %2$s.',
							item.url, error.message
						),
						'danger'
					);
				});
		},

		getListElement(index) {
			return this.$refs.modal.$el.querySelectorAll('.externaldata-item')[index];
		},

		isValid(item) {
			return isValidUrl(item.url);
		},

		canProcess(item) {
			return !item.processed && this.isValid(item);
		},

		canClose() {
			if (this.processing) {
				return false;
			}
			if (!this.modified) {
				return true;
			}
			confirm({
				message: locale.say('There were changes detected for the external data dialog. Are you sure you want to discard those changes?'),
				buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Discard changes'),
				buttonClass: 'danger'
			}).then(() => {
				this.$refs.modal.$emit('close');
			});
			return false;
		},

		download() {
			const processed = this.processed;
			const getPath = (url) => {
				const index = url.indexOf('://');
				return index >= 0 ? url.substring(index + 3) : url;
			};
			const name = this.story.name + '.json';
			const json = {
				data: this.processed.map((item) => ({
					id: uuid(),
					path: getPath(item.url), // will be the name of the passage
					title: item.title,
					author: item.author,
					url: item.url,
					phrases: item.phrases,
					main_keyword: item.main_keyword,
					keywords: item.keywords,
					image_url: item.image_url,
					summary: item.summary,
					date: item.date,
				})),
			};
			save(JSON.stringify(json), name);
		},

		save() {
			const externalData = this.data.map((list) => ({ 
				...list,
				items: list.items
					.filter((item) => !!trim(item.url))
					// .map((item) => ({ ...item, error: undefined })),
			})).filter((list) => list.name || list.items.length > 0);
			this.updateStory(this.storyId, { 
				externalData: externalData.length > 0 ? externalData : undefined
			});
			this.modified = false;
			this.$refs.modal.close();
		},
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
		"detail-view": require("./detail-view"),
	},

});
