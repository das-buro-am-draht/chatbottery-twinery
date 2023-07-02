const Vue = require('vue');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['task'],

	data: () => ({
		options: [],
	}),

	ready() {
		this.options = this.task.opt.map(txt => ({text: txt, modified: false}));
		if (!this.options.length) {
			this.addNew();
		}
		/* this.$nextTick(() => {
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
			return this.options.some(opt => opt.modified);
		},

	},

	methods: {

		onChange(index, event) {
			this.options[index].modified = true;
			// event.target.style.height = `${event.target.scrollHeight}px`;
		},

		onModify(index, event) {
			if (this.options[index].modified && !!this.options[index].text) { // add entry
				this.options[index].modified = false;
			} else { // delete entry
				this.options.splice(index, 1);
			}
			this.task.opt = this.options.filter(opt => !opt.modified && !!opt.text).map(opt => opt.text);
			this.$dispatch('gui_changed');
		},

		addNew() {
			const length = this.options.length;
			this.options.push({text: '', modified: true});
			this.$nextTick(() => {
				const item = this.$el.children[length];
				if (item) {
					const ta = item.getElementsByTagName('textarea');
					if (ta && ta.length > 0)
						ta[0].focus();
				}
			});
		},

	},
});
