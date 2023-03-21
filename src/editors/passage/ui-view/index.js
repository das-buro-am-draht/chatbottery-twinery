
const { XMLParser } = require("fast-xml-parser");
const Vue = require('vue');

const parser = new XMLParser();

module.exports = Vue.extend({
	template: require('./index.html'),

	data: () => ({
		rawSyntax: '<msg>Test</msg>\n<btn>Click!</btn>',
		syntacObjects: [],
	}),

	computed: {
		syntaxObjects() {
			const jObj = parser.parse(this.rawSyntax);

			return jObj;
		}
	},

	methods: {
	}
});
