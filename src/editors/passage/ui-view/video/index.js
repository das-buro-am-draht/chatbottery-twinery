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
		this.load();
	},

	watch: {
		'task.attributes.video'() {
			this.load();
		},
	},

	computed: {
		isValid() {
			return !this.video || isValidUrl(this.video);
		}
	},

	methods: {
		load() {
			const video = this.task.attributes['video'] || '';
			if (video !== this.video) {
				this.video = video;
			}
		},
		onChange(event) {
			this.task.attributes['video'] = this.video;
		},
	},
});
