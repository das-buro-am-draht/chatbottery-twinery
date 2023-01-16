"use strict";

const {
	extractLinkTags,
	removeEnclosingBrackets,
	removeSetters,
	extractLink,
	nonEmptyLinks,
	uniques,
	internalLinks,
} = require("./link-parser");
const uniq = require('lodash.uniq');

const extractLinks = (regexp, text) => {
	let m, match = [];
  while (m = regexp.exec(text)) {
    match.push(m[1]);
  }
  return match;  
}

const extractGoToLinkTags = (text) => 
	extractLinks(/<goto[^>]+\bpassage="(.*)"[^>]*>/g, text);

const extractActOrBtnLinkTags = (text) =>
	extractLinks(/<act.*>(.*)<\/act>/g, text).concat(
	extractLinks(/<btn.*>(.*)<\/btn>/g, text));

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
	const actOrBtnLinks = getResults(extractActOrBtnLinkTags(text), internalOnly);

	return {
		goto: uniq(gotoLinks),
		actOrBtn: uniq(actOrBtnLinks),
	};
};
