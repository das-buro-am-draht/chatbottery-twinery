const Vue = require('vue');
const { trim, isValidUrl } = require('../../../../utils/common');

require('./index.less');

module.exports = Vue.extend({
	template: require('./index.html'),
	props: {
		task: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		iframe: '',
		height: ''
	}),

	ready() {
		const iframe = this.task.attributes['src'] || '';
		const height = this.task.attributes['height'] || '';
		if (iframe !== this.iframe || height !== this.height) {
			this.iframe = iframe;
			this.height = height;
		}
	},

	computed: {
		isValid() {
			return !this.iframe || isValidUrl(this.iframe);
		}
	},

	methods: {
		onChangeUrl(event) {
			this.task.attributes['src'] = this.iframe;
		},
		onChangeHeight(event) {
			this.task.attributes['height'] = trim(this.height);
		},
	},
});
