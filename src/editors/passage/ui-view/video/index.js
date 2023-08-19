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
	},

	data: () => ({
		video: '',
	}),

	ready() {
		const video = this.task.attributes['video'] || '';
		if (video !== this.video) {
			this.video = video;
		}
	},

	computed: {
		isValid() {
			return !this.video || isValidUrl(this.video);
		}
	},

	methods: {
		onChange(event) {
			this.task.attributes['video'] = this.video;
		},
	},
});
