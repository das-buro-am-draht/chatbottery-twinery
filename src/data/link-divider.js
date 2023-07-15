"use strict";

const {
	removeEnclosingBrackets,
	removeSetters,
	extractLink,
	nonEmptyLinks,
	uniques,
	internalLinks,
	extractGoToLinkTags,
	extractActLinkTags,
	extractBtnLinkTags,
} = require("./link-parser");
const uniq = require('lodash.uniq');

const getResults = (links, internalOnly) => {
	let result = links
		? links // extractLinkTags(links.join())
				.map(removeEnclosingBrackets)
				.map(removeSetters)
				.map(extractLink)
				.filter(nonEmptyLinks)
				.filter(uniques)
		: [];

	if (internalOnly) {
		result = result.filter(internalLinks);
	}
	return result;
};

module.exports = (text, internalOnly) => {
	const gotoLinks = getResults(extractGoToLinkTags(text), internalOnly);
	const actOrBtnLinks = getResults(extractActLinkTags(text)
									 .concat(extractBtnLinkTags(text)), internalOnly);

	return {
		goto: uniq(gotoLinks),
		actOrBtn: uniq(actOrBtnLinks),
	};
};
