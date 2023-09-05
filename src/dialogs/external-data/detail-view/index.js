// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');

require("./index.less");

module.exports = Vue.extend({
	template: require("./index.html"),

	props: {
		item: {
			type: Object,
			required: true,
		},
	},

	methods: {
		onChange(event) {
			this.$parent.$parent.modified = true;
		},
	},

	components: {
		"image-placeholder": require("../../../ui/image-placeholder"),
	},

});
