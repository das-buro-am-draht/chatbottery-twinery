const Vue = require('vue');
const specialPassages = require('../../../../data/special-passages');

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
			required: true,
		},
	},

	data: () => ({
		selection: -1,
		passages: null,
		imageUrl: '',
		assetBaseUrl: ''
	}),

	ready() {
		if (this.story) {
			const { settings } = this.story;
			if (settings && settings.assetBaseUrl) {
				this.assetBaseUrl = settings.assetBaseUrl;
			}
			this.passages = this.story.passages
				.map((passage) => passage.name)
				.sort()
				// .concat(Object.values(specialPassages));
		}
		if (!this.task.items.length) {
			this.onAdd();
		} else {
			Vue.nextTick(() => this.setSelection(0));
		}
	},

	methods: {
		drag(index, event) {
			const data = [this._uid, index].join();
			event.dataTransfer.setData('cb/ui-carousel', data);
		},		
		dragenter(event) {
			if (event.dataTransfer && event.dataTransfer.types.includes('cb/ui-carousel')) {
				event.preventDefault(); // is allowed
			}
		},
		drop(index, event) {
			const toIdx = index;
			const [_uid, ix] = event.dataTransfer.getData('cb/ui-carousel').split(',');
			// event.dataTransfer.clearData('cb/ui-carousel');
			if (parseInt(_uid) !== this._uid) {
				return; // don't allow other components
			}
			const fromIdx = parseInt(ix);
			if (!isNaN(fromIdx) && toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.task.items.length) {
				const items = [ ...this.task.items ];
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				items.splice(insertIdx, 0, items[fromIdx]);
				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				items.splice(removeIdx, 1);
				this.task.items = items;

				if (this.selection >= 0) {
					this.setSelection(toIdx);
				}
			}
		},
		setSelection(index) {
			while (index >= this.task.items.length) {
				index--;
			}
			this.selection = index;
			if (index >= 0) {
				const button = this.task.items[index].button;
				this.$els.image.value = this.imageUrl = this.task.items[index].attributes['img'] || '';
				this.$els.title.value = this.task.items[index].title || '';
				this.$els.text.value = this.task.items[index].text || '';
				this.$els.description.value = this.task.items[index].description || '';
				this.$els.label.value = button.label || '';
				this.$els.link.value = button.link || '';
				// this.$els.func.value = button.func || '';
				Vue.nextTick(() => this.$els.image.focus());
			}
		},
		onSelect(index) {
			this.setSelection(index);
		},
		onDelete(index) {
			this.task.items.splice(index, 1);
			if (index === this.selection) {
				this.setSelection(index);
			}
		},
		onAdd() {
			const index = this.task.items.length;
			this.task.items.push({
				attributes: { },
				title: '',
				text: '',
				description: '',
				button: { 
					attributes: { },
					label: '',
					link: '',
					func: '',
				},
			});
			this.setSelection(index);
		},
		onChangeImage(event) {
			if (this.selection >= 0) {
				this.imageUrl = this.task.items[this.selection].attributes['img'] = this.$els.image.value;
			}
		},
		onChangeTitle(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].title = this.$els.title.value;
			}
		},
		onChangeText(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].text = this.$els.text.value;
			}
		},
		onChangeDescription(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].description = this.$els.description.value;
			}
		},
		onChangeLabel(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].button.label = this.$els.label.value;
			}
		},
		onChangeLink(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].button.link = this.$els.link.value;
			}
		},
		// onChangeFunc(event) {
		// 	if (this.selection >= 0) {
		// 		this.task.items[this.selection].button.func = this.$els.func.value;
		// 	}
		// },
	},

	components: {
		'image-placeholder': require('../../../../ui/image-placeholder'),
	},
});
