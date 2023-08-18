const Vue = require('vue');

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
		image: '',
		assetBaseUrl: '',
	}),

	ready() {
		if (this.story) {
			const { settings } = this.story;
			if (settings && settings.assetBaseUrl) {
				this.assetBaseUrl = settings.assetBaseUrl;
			}
		}
		this.load();
	},

	watch: {
		'task.attributes.img'() {
			this.load();
		},
	},

	methods: {
		load() {
			const image = this.task.attributes['img'] || '';
			if (image !== this.image) {
				this.image = image;
			}
		},
		onChange(event) {
			this.task.attributes['img'] = this.image;
		},
	},

	components: {
		'image-placeholder': require('../image-placeholder'),
		'task-options': require('../options'),
	},
});
