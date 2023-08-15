const Vue = require('vue');
const { specialPassages } = require('../../../../data/special-passages');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		story: {
			type: Object,
			required: false,
		},
	},

	data: () => ({
		selection: -1,
		passages: null,
		showAdvanced: false,
	}),

	ready() {
		if (this.story) {
			this.passages = this.story.passages
				.map((passage) => passage.name)
				.sort()
				.concat(Object.values(specialPassages));
		}
		if (!this.task.buttons.length) {
			this.onAdd();
		}
	},

	methods: {
		drag(index, event) {
			const data = [this._uid, index].join();
			event.dataTransfer.setData('cb/ui-button', data);
		},		
		dragenter(event) {
			if (event.dataTransfer.types.includes('cb/ui-button')) {
				event.preventDefault(); // is allowed
			}
		},
		drop(index, event) {
			const toIdx = index;
			const [_uid, ix] = event.dataTransfer.getData('cb/ui-button').split(',');
			event.dataTransfer.clearData('cb/ui-button');
			if (parseInt(_uid) !== this._uid) {
				return; // don't allow other components
			}
			const fromIdx = parseInt(ix);
			if (!isNaN(fromIdx) && toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.task.buttons.length) {
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				this.task.buttons.splice(insertIdx, 0, this.task.buttons[fromIdx]);

				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				this.task.buttons.splice(removeIdx, 1);

				this.$dispatch('gui-changed');
				if (this.selection >= 0) {
					this.setSelection(toIdx);
				}
			}
		},
		setSelection(index) {
			while (index >= this.task.buttons.length) {
				index--;
			}
			this.selection = index;
			if (index >= 0) {
				const button = this.task.buttons[index];
				this.$els.label.value = button.label || '';
				this.$els.link.value = button.link || '';
				this.$els.func.value = button.func || '';
				this.$els.class.value = button.attributes.classname || '';
				this.$els.action.checked = !!button.action;
				Vue.nextTick(() => {
					this.$els.label.focus();
					const element = this.$els.list.children[index];
					if (element) {
						element.scrollIntoView({block: 'nearest', behavior: 'smooth'});
					}
				});
			}
		},
		onShowAdvanced() {
			this.showAdvanced = !this.showAdvanced;
		},
		onSelect(index) {
			this.setSelection(index);
		},
		onDelete(index) {
			this.task.buttons.splice(index, 1);
			this.$dispatch('gui-changed');
			if (index === this.selection) {
				this.setSelection(index);
			}
		},
		onAdd() {
			const index = this.task.buttons.length;
			this.task.buttons.push({
				attributes: { },
				label: '',
				link: '',
				func: '',
				action: false,
			});
			this.setSelection(index);
		},
		onChangeLabel(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].label = this.$els.label.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeLink(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].link = this.$els.link.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeFunc(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].func = this.$els.func.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeClass(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].attributes['classname'] = this.$els.class.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeAction(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].action = this.$els.action.checked;
				this.$dispatch('gui-changed');
			}
		},
	},
});
