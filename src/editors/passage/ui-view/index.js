const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const locale = require('../../../locale');
const notify = require('../../../ui/notify');
const { label } = require('../../../utils/task');
const { openai } = require('../../../common/app/openai');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	data: () => ({
		openai: null,
	}),

	methods: {

		disable() {
			const enable = !this.openai ? true : false;
			Array.from(this.$els.tasks.getElementsByClassName('passageUI-item')).forEach((element) => {
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

		attributes(item) {
			return Object.entries(item.attr || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
		},
		
		onChange(index) {
			this.$dispatch('gui-changed');
		},

		onRemove(index) {
			Promise.resolve(this.gui[index]).then((task) => {
				if (task.text)
					return confirm({
						message: locale.say('Are you sure to delete &ldquo;%1$s&rdquo;?', this.caption(task)),
						buttonLabel: '<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
						buttonClass: 'danger'
				})
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
			event.preventDefault();
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

		loadSuggestions(component, text) {
			let data;
			this.openai = {
				text, 
				loading: true,
				component,
				suggestions: [],
			};
			try {
				const placeholders = {"%PHRASE%": text};
				data = JSON.parse(this.openaiAlts);
				if (data.messages && data.messages.length > 0) {
					data.messages = data.messages.map(message => {
						if (message.content) {
							message.content = message.content.replace(/%\w+%/g, (placeholder) => placeholders[placeholder] || placeholder);
						}
						return message;
					});
				}
			} catch (e) {
				notify(e.message, 'danger');
				this.openai = null;
				return;
			}
			this.openai.suggestions = [];
			openai(data) // Promise.resolve({}) // openai(data)
			.then((response) => {
				const suggestions = [];
				if (response.choices) {
					response.choices.forEach(item => {
						if (item.message && typeof item.message.content === 'string') {
							item.message.content.split(/[\n]/).forEach(text => {
								const suggestion = text.replace(/^[\n\r\s-\d\.\)]+/, '').replace(/[\n\r\s]+$/, '');
								if (suggestion) {
									suggestions.push(suggestion);
								}
							});
						}
					});
				}
				if (!suggestions.length) {
					this.openai = null;
					notify(locale.say('No suggestions were found.'), 'info');
				} else {
					this.openai.suggestions = suggestions;
					this.disable();
				}
			})
			.catch((error) => notify(error.message, 'danger'))
			.finally(() => {
				if (this.openai) {
					this.openai.loading = false;
				}
			});
		}
	},

	vuex: {
		getters: {
			openaiAlts: state => state.pref.openaiAlts,
		},
	},

	components: {
		'ui-txt': require('./ui-txt'),
		'task-menu': require('./task-menu'),
	},
});
