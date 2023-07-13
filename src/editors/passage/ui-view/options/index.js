const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		addLabel: {
			type: String,
			default: 'Add Text alternative',
			required: false,
		},
	},

	ready() {
		/* Vue.$nextTick(() => {
			Array.from(this.$el.children).forEach(child => {
				const ta = child.getElementsByTagName('textarea');
				if (ta && ta.length) {
					ta[0].style.height = `${ta[0].scrollHeight}px`;
				}
			});
		}); */
	},

	computed: {		
		isModified() {
			return this.task.opt.some((option) => !option);
		},
	},

	methods: {
		onChange(index, event) {
			this.synchronize();
			// event.target.style.height = `${event.target.scrollHeight}px`;
		},
		onDelete(index, event) {
			this.task.opt.splice(index, 1);
			this.synchronize();
		},
		addNew() {
			const length = this.task.opt.length;
			this.task.opt.push('');
			Vue.nextTick(() => {
				const item = this.$el.children[length];
				if (item) {
					const ta = item.getElementsByTagName('textarea');
					if (ta && ta.length > 0)
						ta[0].focus();
				}
			});
		},
		synchronize() {
			this.$dispatch('gui-changed');
		},
		onOpenai(event, index) {
			this.$dispatch('openai-suggest', this, this.task.opt[index]);
		},
	},

	events: {
		'openai-selected'(text) {
			this.task.opt.push(text);
			this.synchronize();
		},
	},
});
