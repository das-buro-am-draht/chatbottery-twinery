const Vue = require('vue');

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
		this.video = this.task.attributes['video'] || '';
	},

	methods: {
		onChange(event) {
			this.task.attributes['video'] = this.video;
			this.$dispatch('gui-changed');
		},
	},
});
