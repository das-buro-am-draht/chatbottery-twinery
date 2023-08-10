const Vue = require('vue');
const { isValidUrl } = require('../../../../utils/common');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		imageUrl: {
			type: String,
			required: true,
		},
		assetBaseUrl: {
			type: String,
			required: false,
			default: '',
		},
	},

	data: () => ({
		src: '',
	}),

	ready() {
		this.load();
	},

	watch: {
		'imageUrl'() {
			this.load();
		},
	},

	computed: {
		background() {
			return this.imageUrl ? '#fff' : '#e2e2e2';
		},
	},

	methods: {
		load() {
			if (!this.imageUrl) {
				this.src = require('../../../../common/img/element-image-white.svg');
				this.$els.image.style.width = '';
				this.$els.image.style.height = '';
				this.$els.image.style.backgroundColor = '#e2e2e2';
			} else {
				if (isValidUrl(this.imageUrl)) {
					this.src = this.imageUrl;
				} else {
					this.src = this.assetBaseUrl + this.imageUrl;
				}
				this.$els.image.style.width = '100%';
				this.$els.image.style.height = 'auto';
				this.$els.image.style.backgroundColor = '';
			}
		},
		onError(event) {
			this.src = require('../../../../common/img/element-image.svg');
			this.$els.image.style.width = '';
			this.$els.image.style.height = '';
		},
	},
});
