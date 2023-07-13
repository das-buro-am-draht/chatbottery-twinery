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
		this.image = this.task.attributes['img'] || '';
	},

	computed: {
		imageUrl() {
			return !this.image || isValidUrl(this.image) ? this.image : this.assetBaseUrl + this.image;
		},
	},

	methods: {
		onChange(event) {
			this.task.attributes['img'] = this.image;
			this.$dispatch('gui-changed');
		},
	},

	components: {
		'task-options': require('../options'),
	},
});
