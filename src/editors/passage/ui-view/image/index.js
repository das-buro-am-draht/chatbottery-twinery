const Vue = require('vue');
const { isValidUrl } = require('../../../../utils/common');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
		assetBaseUrl: {
			type: String,
			required: true,
			default: '',
		},
	},

	data: () => ({
		image: '',
	}),

	ready() {
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
				this.setImage(this.image = image);
			}
		},
		setImage(image) {
			const imageUrl = !image || isValidUrl(image) ? image : this.assetBaseUrl + image;
			this.$els.image.src = imageUrl;
			this.$els.image.style.width = '100%';
		},
		onChange(event) {
			this.setImage(this.image);
			this.task.attributes['img'] = this.image;
			this.$dispatch('gui-changed');
		},
		onError(event) {
			this.$els.image.src = require('../../../../common/img/element-image.svg');
			this.$els.image.style.width = '50%';
		}
	},

	components: {
		'task-options': require('../options'),
	},
});
