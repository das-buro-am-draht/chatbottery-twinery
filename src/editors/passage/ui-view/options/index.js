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
		this.load();
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
		isModified() {
			return this.options.some(opt => opt.modified || !opt.text);
		},
	},

	watch: {
		'task.opt'() {
			this.load();
		}
	},

	methods: {
		load() {
			this.options = (this.task.opt || []).map(txt => ({
				text: txt, 
				modified: false,
			}));
		},
		hasChanged(index) {
			return this.options[index].modified && !!this.options[index].text;
		},
		bgStyle(index) {
			const color = this.options[index].modified ? '#3a51fa' : '#eee';
			const image = !this.options[index].modified ? 'ui-delete' : this.options[index].text ? 'ui-save' : 'ui-delete-white';
			const imageUrl = require(`../../../../common/img/${image}.svg`);
			return {
				backgroundColor: color,
				backgroundImage: `url(${imageUrl})`,
			}
		},
		onChange(index, event) {
			this.options[index].modified = true;
			// event.target.style.height = `${event.target.scrollHeight}px`;
		},
		onModify(index) {
			if (this.hasChanged(index)) { // add entry
				this.options[index].modified = false;
			} else { // delete entry
				this.options.splice(index, 1);
			}
			this.synchronize();
		},
		onEnter(index, event) {
			if (event.ctrlKey && this.hasChanged(index)) {
				event.preventDefault();
				this.onModify(index);
				Vue.nextTick(() => this.addNew());
			}
		},
		addNew() {
			const length = this.options.length;
			this.options.push({
				text: '', 
				modified: true,
			});
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
			this.task.opt = this.options.filter(opt => !opt.modified && !!opt.text).map(opt => opt.text);
			this.$dispatch('gui-changed');
		},
		onOpenai(event, index) {
			this.$dispatch('openai-suggest', this, this.options[index].text);
		},
	},

	events: {
		'openai-selected'(text) {
			this.options.push({
				text,
				modified: false,
			});
			this.synchronize();
		},
	},
});
