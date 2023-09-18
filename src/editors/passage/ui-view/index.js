const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');
const { isEmpty } = require('../../../utils/common');
const { phraseSuggestions } = require('../../../common/app/openai');
const { label, createTask } = require('../../../utils/task');

require('./index.less');

const CLASS_COLLAPSED = 'collapsed';

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		tasks: {
			type: Array,
			required: true,
		},
		story: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		openai: null,
		settings: 0,
		userData: {},
	}),

	ready() {
		this.userData = Object.entries(this.story.userData || {})
			.filter(([k, v]) => v.type !== 'function')
			.reduce((prev, data) => {
				prev[data[0]] = data[1].type;
				return prev;
			}, {});

		Array.from(this.taskElements).forEach((element) => element.classList.add(CLASS_COLLAPSED));
	},

	computed: {
		conditions() {
			const conditions = [];
			Object.entries(this.userData).forEach(([name, type]) => {
				switch (type) {
					default:
						conditions.push(`${name} === 'value'`);
						conditions.push(`!${name}`);
						break;
					case 'boolean':
						conditions.push(`${name}`);
						conditions.push(`!${name}`);
						break;
					case 'number':
						conditions.push(`${name} === 1`);
						conditions.push(`${name} !== 1`);
						break;
					case 'date':
						conditions.push(`${name} > Date.now()`);
						break;
				}
			});
			return conditions;
		},
		taskElements() {
			return this.$els.tasks.getElementsByClassName('passageUI-task');
		},
		assetBaseUrl() {
			const { settings } = this.story;
			return (settings && settings.assetBaseUrl) || '';
		},
	},

	methods: {
		isCollapsed(index) {
			return this.taskElements[index].classList.contains(CLASS_COLLAPSED);
		},
		onCopy(index) {
			const objBlob = new Blob([JSON.stringify(this.tasks[index])], { type: 'text/plain'});
			const item = new ClipboardItem({[objBlob.type]: objBlob});
			navigator.clipboard.write([item])
				.then(() => notify(locale.say('Task was written to clipboard.'), 'info'))
				.catch((error) => notify(error.message, 'danger'));
		},
		onSettings(index) {
			this.settings ^= 1 << index;
		},
		onTaskClicked(index) {
			const elements = this.taskElements;
			const element = elements[index];
			if (element.classList.contains(CLASS_COLLAPSED)) {
				Array.from(elements).forEach((element, ix) => {
					if (ix === index) {
						element.classList.remove(CLASS_COLLAPSED);
					} else {
						element.classList.add(CLASS_COLLAPSED);
					}
				});
			}
			element.scrollIntoView({block: 'nearest', behavior: 'smooth'});
		},
		toggleCollapse(index) {
			this.taskElements[index].classList.toggle(CLASS_COLLAPSED);
		},
		disable() {
			const enable = !this.openai ? true : false;
			Array.from(this.taskElements).forEach((element) => {
				if (enable) {
					element.classList.remove('disabled');
				} else if (!this.openai.component || !element.contains(this.openai.component.$el)) {
					element.classList.add('disabled');
				}
			});
		},
		caption(task) {
			return label(task.type);
		},
		isEmpty(task) {
			let empty = isEmpty(task.attributes);
			if (empty) {
				switch (task.type) {
					case 'txt':
					case 'image':
						empty = isEmpty(task.opt);
						break;
					case 'buttons':
						empty = isEmpty(task.buttons);
						break;
					case 'carousel':
					case 'tiles':
						empty = isEmpty(task.items);
						break;
				}
			}
			return empty;
		},
		onDelete(index) {
			Promise.resolve(this.tasks[index]).then((task) => {
				if (!this.isEmpty(task)) {
					return confirm({
						message: locale.say('Are you sure to delete &ldquo;%1$s&rdquo;?', this.caption(task)),
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
						buttonClass: 'danger'
					});
				}
			}).then(() => {
				this.settings &= ~(1 << index);
				this.tasks.splice(index, 1);
			});
		},		
		drag(index, event) {
			event.dataTransfer.setData('cb/ui-task', index);
		},
		dragenter(event) {
			if (event.dataTransfer.types.includes('cb/ui-task')) {
				event.preventDefault(); // is allowed
			}
		},
		drop(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData('cb/ui-task'), 10);
			event.dataTransfer.clearData('cb/ui-task');
			if (toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.tasks.length) {
				const tasks = [ ...this.tasks ];
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				tasks.splice(insertIdx, 0, tasks[fromIdx]);
				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				tasks.splice(removeIdx, 1);
				this.tasks.splice(0, this.tasks.length, ...tasks);

				let settings = this.settings;
				if ((((settings & (1 << fromIdx)) >> fromIdx) ^ ((settings & (1 << toIdx)) >> toIdx)) == 1)
				{
					settings ^= (1 << fromIdx);
					settings ^= (1 << toIdx);
					this.settings = settings;
				}
				
				this.onTaskClicked(index);
			}
		},
		settingsStyle(index) {
			let image = 'blank';
			let color = '#fff';
			if (this.settings & (1 << index)) {
				color = '#c9cef4';
				// image = 'white';
			} else if (this.tasks[index] && this.tasks[index].attributes['if']) {
				image = 'red';
			}
			const imageUrl = require(`../../../common/img/ui-settings-${image}.svg`);
			return {
				backgroundColor: color,
				backgroundImage: `url(${imageUrl})`,
			};
		},
		closeSuggestions() {
			this.openai = null;
			this.disable();
		},
		addSuggestion(index) {
			if (this.openai.component) {
				const suggestion = this.openai.suggestions[index];
				this.openai.suggestions.splice(index, 1);
				this.openai.component.$emit('openai-selected', suggestion);
			}
		},
		addTask(type) {
			const index = this.tasks.length;
			const task = createTask(type);
			this.tasks.push(task);
			Vue.nextTick(() => this.onTaskClicked(index));
		},
	},

	events: {
		'openai-suggest'(component, text) {
			this.openai = {
				text, 
				loading: true,
				component,
				suggestions: [],
			};
			Promise.resolve(this.openaiPhrases)
				.then((params) => phraseSuggestions(params, text))
				.then((suggestions) => {
					if (!suggestions.length) {
						this.openai = null;
						notify(locale.say('No suggestions were found.'), 'info');
					} else {
						this.openai.suggestions = suggestions;
						this.disable();
					}
				})
				.catch((error) => {
					notify(error.message, 'danger');
					this.openai = null;
				})
				.finally(() => {
					if (this.openai) {
						this.openai.loading = false;
					}
				});
		},
	},

	vuex: {
		getters: {
			openaiPhrases: state => state.pref.openaiPhrases,			
		},
	},

	components: {
		'ui-menu': require('./menu'),
		'task-xml': require('./xml'),
		'task-txt': require('./txt'),
		'task-wait': require('./wait'),
		'task-eval': require('./eval'),
		'task-goto': require('./goto'),
		'task-image': require('./image'),
		'task-video': require('./video'),
		'task-iframe': require('./iframe'),
		'task-buttons': require('./buttons'),
		'task-carousel': require('./carousel'),
		'task-tiles': require('./tiles'),
		'task-chat': require('./chat'),
	},
});
