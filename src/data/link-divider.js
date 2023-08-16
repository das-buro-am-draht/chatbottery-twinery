"use strict";

const {
	gotoLinks,
	buttonLinks,
} = require("./link-parser");
const uniq = require('lodash.uniq');

module.exports = (text, internalOnly) => {
	return {
		goto: uniq(gotoLinks(text, internalOnly)),
		actOrBtn: uniq(buttonLinks(text, internalOnly)),
	};
};
