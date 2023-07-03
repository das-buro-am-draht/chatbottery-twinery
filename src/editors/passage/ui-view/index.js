const Vue = require('vue');
const { confirm } = require('../../../dialogs/confirm');
const locale = require('../../../locale');
const { label } = require('../../../utils/task');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	methods: {

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
		}
	},

	components: {
		'ui-txt': require('./ui-txt'),
		'task-menu': require('./task-menu'),
	},
});
