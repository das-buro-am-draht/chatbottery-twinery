const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');
const { label } = require('../../../utils/task');
const { phraseSuggestions } = require('../../../common/app/openai');

require('./index.less');

const CLASS_COLLAPSED = 'collapsed';

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		gui: {
			type: Array,
			required: true,
		},
		story: {
			type: Object,
			required: true,
		},
	},

	ready() {
		Array.from(this.taskElements)
			.forEach((element) => element.classList.add(CLASS_COLLAPSED));
	},

	data: () => ({
		openai: null,
	}),

	computed: {
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
		onTaskClicked(index) {
			const elements = this.taskElements;
			if (elements[index].classList.contains(CLASS_COLLAPSED)) {
				Array.from(elements).forEach((element, ix) => {
					if (ix === index) {
						element.classList.remove(CLASS_COLLAPSED);
					} else {
						element.classList.add(CLASS_COLLAPSED);
					}
				});
			}
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
			Promise.resolve(this.gui[index]).then((task) => {
				if (!this.isEmpty(task)) {
					return confirm({
						message: locale.say('Are you sure to delete &ldquo;%1$s&rdquo;?', this.caption(task)),
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
						buttonClass: 'danger'
					});
				}
			}).then(() => {
				this.gui.splice(index, 1);
				this.$dispatch('gui-changed');
			});
		},		
		drag(index, event) {
			event.dataTransfer.setData("text/plain", index);
		},		
		drop(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData("text/plain"));
			event.dataTransfer.clearData("text/plain");
			
			const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
			this.gui.splice(insertIdx, 0, this.gui[fromIdx]);

			const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
			this.gui.splice(removeIdx, 1);

			this.$dispatch('gui-changed');
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
		'task-img': require('./image'),
		'task-btn': require('./buttons'),
	},
});
