const Vue = require('vue');
const { specialPassages } = require('../../../../data/special-passages');

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
		this.$els.caption.value = this.task.attributes['caption'] || '';
		this.$els.initial.value = this.task.attributes['initial'] || '';
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
			event.dataTransfer.setData('cb/ui-tiles', data);
		},		
		dragenter(event) {
			if (event.dataTransfer.types.includes('cb/ui-tiles')) {
				event.preventDefault(); // is allowed
			}
		},
		drop(index, event) {
			const toIdx = index;
			const [_uid, ix] = event.dataTransfer.getData('cb/ui-tiles').split(',');
			event.dataTransfer.clearData('cb/ui-tiles');
			if (parseInt(_uid) !== this._uid) {
				return; // don't allow other components
			}
			const fromIdx = parseInt(ix);
			if (!isNaN(fromIdx) && toIdx !== fromIdx && fromIdx >= 0 && fromIdx < this.task.items.length) {
				const insertIdx = toIdx > fromIdx ? toIdx + 1 : toIdx;
				this.task.items.splice(insertIdx, 0, this.task.items[fromIdx]);

				const removeIdx = toIdx > fromIdx ? fromIdx : fromIdx + 1;
				this.task.items.splice(removeIdx, 1);

				this.$dispatch('gui-changed');
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
				const button = this.task.items[index].link;
				this.$els.image.value = this.imageUrl = this.task.items[index].attributes['img'] || '';
				this.$els.title.value = this.task.items[index].title || '';
				this.$els.description.value = this.task.items[index].description || '';
				this.$els.link.value = button.link || '';
				Vue.nextTick(() => this.$els.image.focus());
			}
		},
		onSelect(index) {
			this.setSelection(index);
		},
		onDelete(index) {
			this.task.items.splice(index, 1);
			this.$dispatch('gui-changed');
			if (index === this.selection) {
				this.setSelection(index);
			}
		},
		onAdd() {
			const index = this.task.items.length;
			this.task.items.push({
				attributes: { },
				title: '',
				description: '',
				link: { 
					attributes: { },
					label: '',
					link: '',
					func: '',
				},
			});
			this.setSelection(index);
		},
		onChangeCaption(event) {
			this.task.attributes['caption'] = this.$els.caption.value;
			this.$dispatch('gui-changed');
		},
		onChangeInitial(event) {
			this.task.attributes['initial'] = this.$els.initial.value;
			this.$dispatch('gui-changed');
		},
		onChangeImage(event) {
			if (this.selection >= 0) {
				this.imageUrl = this.task.items[this.selection].attributes['img'] = this.$els.image.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeTitle(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].title = this.$els.title.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeDescription(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].description = this.$els.description.value;
				this.$dispatch('gui-changed');
			}
		},
		onChangeLink(event) {
			if (this.selection >= 0) {
				this.task.items[this.selection].link.link = this.$els.link.value;
				this.$dispatch('gui-changed');
			}
		},
	},

	components: {
		'image-placeholder': require('../image-placeholder'),
	},
});
