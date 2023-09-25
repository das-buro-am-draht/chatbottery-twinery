const Vue = require('vue');
const { 
	label, 
	types, 
	createTask, 
	clipboardTask,
} = require('../../../../utils/task');

module.exports = Vue.extend({

	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: false,
		},
	},

	data: () => ({
		clipboard: false,
	}),

	events: {
		'drop-down-opened'() {
			this.clipboard = false;
			clipboardTask().then((task) => this.clipboard = !!task);
		},
	},

	computed: {
		types() {
			const items = { };
			Object.entries(types).forEach(([key, value]) => {
				switch (key) {
					case 'chat':
						if (!(this.story && this.story.plugins && this.story.plugins.chat)) {
							break;
						}
					default:
						items[key] = value;
						break;
				}
			});
			return items;
		},
	},

	methods: {
		label: (type) => label(type),

		paste() {
			clipboardTask().then((task) => {
				if (task) {
					this.$parent.addTask(task);
				}
			});
		},

		addNew(type) {
			this.$parent.addTask(createTask(type));
		},
		image(type) {
			switch (type) {
				default:
					return require('../../../../common/img/element-textmessage.svg');
				case 'buttons':
					return require('../../../../common/img/element-buttons.svg');
				case 'image':
					return require('../../../../common/img/element-image.svg');
				case 'video':
					return require('../../../../common/img/element-video.svg');
				case 'iframe':
					return require('../../../../common/img/element-iframepdf.svg');
				case 'carousel':
					return require('../../../../common/img/element-carousel.svg');
				case 'tiles':
					return require('../../../../common/img/element-tiles.svg');
				case 'wait':
					return require('../../../../common/img/element-record-variable.svg');
				case 'eval':
					return require('../../../../common/img/element-set-variable.svg');
				case 'goto':
					return require('../../../../common/img/element-goto.svg');
				case 'chat':
					return require('../../../../common/img/livechat-icon.svg');
			}
		},
	},

	components: {
		'drop-down': require('../../../../ui/drop-down'),
	}
});