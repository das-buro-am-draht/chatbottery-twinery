
const { XMLParser } = require("fast-xml-parser");
const Vue = require('vue');

const parser = new XMLParser({
	preserveOrder: true,
	alwaysCreateTextNode: true,
	ignoreAttributes:false
});

module.exports = Vue.extend({
	template: require('./index.html'),
	props: ['syntax'],
	data: () => ({
		syntaxObjects: []
	}),

	computed: {
		syntaxObjects() {
			let ret;
			try {
				ret = parser.parse(this.syntax);
			} catch (e) {
				console.log("error parsing syntax", e);
				ret = [];
			}

			return ret;
		}
	},

	methods: {
	}
});
