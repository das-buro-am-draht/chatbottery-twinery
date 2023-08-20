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

	data: () => ({
		options: [],
	}),

	ready() {
		this.options = this.task.opt || [];
		/* Vue.nextTick(() => {
			Array.from(this.$el.children).forEach(child => {
				const ta = child.getElementsByTagName('textarea');
				if (ta && ta.length) {
					ta[0].style.height = `${ta[0].scrollHeight}px`;
				}
			});
		}); */
	},

	computed: {		
		hasEmpty() {
			return this.options.length > 0 && this.options.some(option => !option);
		},
	},

	methods: {
		onChange(index, event) {
			this.synchronize();
			// event.target.style.height = `${event.target.scrollHeight}px`;
		},
		onDelete(index) {
			this.options.splice(index, 1);
			this.synchronize();
		},
		onEnter(index, event) {
			if (event.ctrlKey) {
				event.preventDefault();
				Vue.nextTick(() => this.addNew());
			}
		},
		addNew() {
			const length = this.options.length;
			this.options.push('');
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
			this.task.opt = this.options; // .length > 1 ? this.options.filter(option => !!option) : this.options;
		},
		onOpenai(event, index) {
			this.$dispatch('openai-suggest', this, this.options[index]);
		},
	},

	events: {
		'openai-selected'(text) {
			this.options.push(text);
			this.synchronize();
		},
	},
});
