const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		selection: -1,
	}),

	methods: {
		drag(index, event) {
			event.dataTransfer.setData("text/plain", index);
		},		
		drop(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData("text/plain"));
			event.dataTransfer.clearData("text/plain");
			
			const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
			this.task.buttons.splice(insertIdx, 0, this.task.buttons[fromIdx]);

			const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
			this.task.buttons.splice(removeIdx, 1);

			this.$dispatch('gui-changed');
		},
		setSelection(index) {
			this.selection = index;
			if (index >= 0) {
				const button = this.task.buttons[index];
				this.$els.label.value = button.label || '';
				this.$els.link.value = button.link || '';
				this.$els.func.value = button.func || '';
				this.$els.action.checked = !!button.action;
				Vue.nextTick(() => {
					this.$els.label.focus();
					const element = this.$els.list.children[index];
					if (element) {
						element.scrollIntoView({behavior: 'smooth'});
					}
				});
			}
		},
		onSelect(index) {
			this.setSelection(index);
		},
		onDelete(index) {
			this.task.buttons.splice(index, 1);
			this.$dispatch('gui-changed');
			this.setSelection(-1);
		},
		onAdd() {
			const index = this.task.buttons.length;
			this.task.buttons.push({
				attributes: {},
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
		onChangeAction(event) {
			if (this.selection >= 0) {
				this.task.buttons[this.selection].action = this.$els.action.checked;
				this.$dispatch('gui-changed');
			}
		},
	},
});
