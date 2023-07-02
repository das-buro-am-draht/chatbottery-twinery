const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['gui'],

	computed: {
	},

	methods: {

		caption(task) {
			// 'txt,msg,later,wait,goto,carousel,tiles,chat,sms,call'
			switch (task.type) {
				case 'txt'     : return 'Text messages';
				case 'msg'     : return 'Messages';
				case 'later'   : return 'Delayed Message';
				case 'wait'    : return 'User Input';
				case 'goto'    : return 'Deviation';
				case 'carousel': return 'Carousel';
				case 'tiles'   : return 'Tiles';
				case 'chat'    : return 'Chat';
				case 'sms'     : return 'SMS (Voice Bot)';
				case 'call'    : return 'Call Control (Voice Bot)';
			}
		},

		attributes(item) {
			return Object.entries(item.attr || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
		},
		
		onChange(index, event) {
			this.$dispatch('gui_changed');
		},

		onRemove(index, event) {
			this.gui.splice(index, 1);
			this.$dispatch('gui_changed');
		},
		
		setIdx(index, event) {
			event.dataTransfer.setData("text/plain", index);
		},
		
		switchToIndex(index, event) {
			const toIdx = index;
			const fromIdx = parseInt(event.dataTransfer.getData("text/plain"));
			event.dataTransfer.clearData("text/plain");
			this.gui.splice(toIdx, 0, this.gui[fromIdx]);

			const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
			this.gui.splice(removeIdx, 1);

			this.$dispatch('gui_changed');
			event.preventDefault();
		}
	},

	components: {
		'ui-txt': require('./ui-txt')
	},
});
