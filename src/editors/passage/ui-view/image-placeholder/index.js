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
		this.$els.image.style.maxHeight = 'unset';
		this.load();
	},

	watch: {
		'imageUrl'() {
			this.load();
		},
	},

	methods: {
		load() {
			if (!this.imageUrl) {
				this.src = require('../../../../common/img/element-image-white.svg');
				this.$els.phold.style.backgroundColor = '#e2e2e2';
			} else {
				if (isValidUrl(this.imageUrl)) {
					this.src = this.imageUrl;
				} else {
					this.src = this.assetBaseUrl + this.imageUrl;
				}
				this.$els.phold.style.backgroundColor = '';
			}
		},
		onError(event) {
			this.src = require('../../../../common/img/element-image.svg');
			this.$els.phold.style.backgroundColor = '#e2e2e2';
		},
	},
});
