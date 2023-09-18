const Vue = require('vue');
const { label, types } = require('../../../../utils/task');

module.exports = Vue.extend({

	template: require('./index.html'),

	props: {
		story: {
			type: Object,
			required: false,
		},
	},

	// data: () => ({
	// 	clipboard: false,
	// }),

	// ready() {
	// 	navigator.clipboard.read().then((items) => {
	// 		for (const item of items) {
	// 			for (const type of item.types) {
	// 				if (type === 'text/plain') {
	// 					this.clipboard = true;
	// 					return;
	// 				}
	// 			}
	// 		}
	// 	});
	// },

	computed: {
		types() {
			const items = { };
			items['clipboard'] = 'Paste here'
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
		}
	},

	methods: {
		label: (type) => label(type),

		addNew(type) {
			if (type === 'clipboard') {
				navigator.clipboard.read().then((items) => { 
					for (const item of items) {
						for (const type of item.types) {
							if (type === 'text/plain') {
								return item.getType(type).then((blob) => blob.text().then((text) => {
									try {
										const task = JSON.parse(text);
										if (task.type && types[task.type]) {
											const index = this.$parent.tasks.length;
											this.$parent.tasks.push(task);
											Vue.nextTick(() => this.$parent.onTaskClicked(index));
										}
									} catch(e) { }
								}));
							}
						}
					}
				});
			} else {
				this.$parent.addTask(type);
			}
		},
		image(type) {
			switch (type) {
				default:
					return require('../../../../common/img/element-textmessage.svg');
				case 'clipboard':
					return require('../../../../common/img/ui-paste.svg');
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