const Vue = require('vue');
const { trim } = require('../../../../utils/common');

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
		this.iframe = this.task.attributes['src'] || '';
		this.height = this.task.attributes['height'] || '';
	},

	methods: {
		onChangeUrl(event) {
			this.task.attributes['src'] = this.iframe;
			this.$dispatch('gui-changed');
		},
		onChangeHeight(event) {
			const height = trim(this.height);
			if (!height) {
				delete this.task.attributes['height'];
			} else {
				this.task.attributes['height'] = height;
			}
			this.$dispatch('gui-changed');
		},
	},
});
