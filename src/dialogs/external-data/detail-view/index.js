// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const { trim } = require('../../../utils/common');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	props: {
		item: {
			type: Object,
			required: true,
		},
	},

	data: () => ({
		keywords: '',
		summary: '',
	}),

	ready() {
		this.keywords = Array.isArray(this.item.keywords_custom) ? this.item.keywords_custom.join(',') : this.item.keywords_custom;
		this.summary = this.item.summary_custom || this.item.summary;
	},

	methods: {
		onChangeKeywords(event) {
			this.item.keywords_custom = this.keywords.split(',').map((keyword) => trim(keyword)).filter((keyword) => keyword && !this.item.keywords.includes(keyword));
			this.$parent.$parent.modified = true;
		},
		onChangeSummary(event) {
			this.item.summary_custom = this.summary === this.item.summary ? '' : this.summary;
			this.$parent.$parent.modified = true;
		},
	},

	components: {
		"image-placeholder": require("../../../ui/image-placeholder"),
	},

});
