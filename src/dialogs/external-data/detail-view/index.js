// A component showing a modal dialog where a story's JavaSCript.

const Vue = require('vue');
const uniq = require('lodash.uniq');
const { trim } = require('../../../utils/common');

require("./index.less");

const textToArray = (text) => uniq(text.split(',').map((item) => trim(item)).filter((item) => !!item));

module.exports = Vue.extend({
	template: require("./index.html"),

	props: {
		item: {
			type: Object,
			required: true,
		},
	},

	computed: {
		keywords() {
			return this.item.keywords.join(', ');
		},
		phrases() {
			return this.item.phrases.join(', ');
		},
	},

	methods: {
		onChange(event) {
			this.$parent.$parent.modified = true;
		},
		onChangeKeywords(event) {
			this.item.keywords = textToArray(event.target.value);
			this.onChange(event);
		},
		onChangePhrases(event) {
			this.item.phrases = textToArray(event.target.value);
			this.onChange(event);
		},
	},

	components: {
		"image-placeholder": require("../../../ui/image-placeholder"),
	},

});
