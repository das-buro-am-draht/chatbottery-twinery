const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');
const { label } = require('../../../utils/task');
const { phraseSuggestions } = require('../../../common/app/openai');
const { createTask } = require('../../../utils/task');

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
						conditions.push(`${name} !== 'value'`);
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
		onSettings(index) {
			this.settings ^= 1 << index;
		},
		onChangeSettings(event) {
			this.$dispatch('gui-changed');
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
			let isEmpty = Object.keys(task.attributes).length === 0;
			if (isEmpty) {
				switch (task.type) {
					case 'txt':
					case 'image':
						isEmpty = !task.opt.some((option) => !!option.trim());
						break;
					case 'buttons':
						isEmpty = task.buttons.length === 0;
						break;
				}
			}
			return isEmpty;
		},
		onRemove(index) {
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
				this.$dispatch('gui-changed');
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
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				this.tasks.splice(insertIdx, 0, this.tasks[fromIdx]);

				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				this.tasks.splice(removeIdx, 1);

				let settings = this.settings;
				if ((((settings & (1 << fromIdx)) >> fromIdx) ^ ((settings & (1 << toIdx)) >> toIdx)) == 1)
				{
					settings ^= (1 << fromIdx);
					settings ^= (1 << toIdx);
					this.settings = settings;
				}

				this.$dispatch('gui-changed');
				
				this.onTaskClicked(index);
			}
		},
		settingsStyle(index) {
			let image = 'blank';
			let color = '#fff';
			if (this.settings & (1 << index)) {
				color = '#3a51fa';
				image = 'white';
			} else if (this.tasks[index].attributes.if) {
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
			this.$dispatch('gui-changed');
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
	},
});
