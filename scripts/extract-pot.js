/*
Creates src/locale/po/template.pot by scanning the application source.
*/

'use strict';
const acorn = require('acorn');
const estraverse = require('estraverse');
const fs = require('fs');
const htmlParser = require('htmlparser2');
const glob = require('glob');
const poFile = require('pofile');

let result = new poFile();

function addItem(location, string, pluralString, comment) {
	/*
	Clean up the comment.
	*/

	if (comment) {
		comment = comment.trim().replace(/[\t\r\n]+/g, ' ');
	}

	/*
	Check for an existing item.
	*/

	let existing = result.items.find(item => item.msgid === string);

	if (existing) {
		existing.references.push(location);

		if (comment) {
			existing.extractedComments.push(comment);
		}
	}
	else {
		let item = new poFile.Item();

		item.msgid = string;
		item.msgid_plural = pluralString;
		item.references = [location];

		if (pluralString) {
			item.msgstr = ['', ''];
		}

		if (comment) {
			item.extractedComments = [comment];
		}

		result.items.push(item);
	}
}

/*
Parse .html files for text in this format: 
:attribute="'Simple string' | say"
:attribute="'Singular string' | sayPlural 'Plural string'"
{{ 'Simple string' | say }}
{{ 'Singular string' | sayPlural 'Plural string' }} 
*/

const templateRegexp = /(?::[a-zA-Z-]+="\s*'([^"]+)(?<!\\)'\s*\|\s*say(?:Plural\s*(?:'(.+)(?<!\\)'))?)|(?:{{{?\s*'([^}]+)(?<!\\)'\s*\|\s*say(?:Plural\s*(?:'([^}]+)(?<!\\)'))?[^}]*}}}?)|(?:{{{?\s*"([^}]+)(?<!\\)"\s*\|\s*say(?:Plural\s*(?:"([^}]+)(?<!\\)"))?[^}]*}}}?)/gm;

glob.sync('src/**/*.html').forEach(fileName => {
	let match;
	const source = fs.readFileSync(fileName, { encoding: 'utf8' });
	while (match = templateRegexp.exec(source)) {
		/*
		match[1]: singular form of the string 
		match[2]: plural form of the string, if any.
		*/

		addItem(fileName, match[1] || match[3] || match[5], match[2] || match[4] || match[6]);
	}
});

/*
Parse .js files for say() and sayPlural() calls.
*/

glob.sync('src/**/*.js').forEach(fileName => {
	/*
	Simplifies an expression (e.g. 'a compound ' + ' string') to a single
	value.
	*/

	function parseValue(node) {
		switch (node.type) {
			case 'Literal':
				/*
				We can't use .value here because we need to keep the strings
				intact with Unicode escapes.
				*/
				
				return node.raw.replace(/^['"]/, '').replace(/['"]$/, '');

			case 'BinaryExpression':
				if (node.operator === '+') {
					return parseValue(node.left) + parseValue(node.right);
				}

				throw new Error(`Don't know how to parse operator ${node.operator}`);

			default:
				throw new Error(`Don't know how to parse value of ${node.type}`);
		}
	}

	let comments = [];
	try {
		const ast = acorn.parse(
			fs.readFileSync(fileName, { encoding: 'utf8' }),
			{
				ecmaVersion: 9,
				locations: true,
				onComment: comments
			}
		);

		estraverse.traverse(
			ast,
			{
				enter: function(node, parent) {
					if (node.type === 'CallExpression') {
						let funcName;

						if (node.callee.type === 'Identifier') {
							funcName = node.callee.name;
						}
						else if (node.callee.type === 'MemberExpression') {
							funcName = node.callee.property.name;
						}

						/*
						Check for a comment that ended 0-2 lines before this call.
						*/

						const precedingComment = comments.find(comment =>
							Math.abs(comment.loc.end.line - node.loc.start.line) < 3 &&
							/^\s*L10n/.test(comment.value)
						);

						if (funcName === 'say') {
							addItem(
								fileName + ':' + node.loc.start.line,
								parseValue(node.arguments[0]),
								null,
								precedingComment ? precedingComment.value : null
							);
						}

						if (funcName === 'sayPlural') {
							addItem(
								fileName + ':' + node.loc.start.line,
								parseValue(node.arguments[0]),
								parseValue(node.arguments[1]),
								precedingComment ? precedingComment.value : null
							);
						}
					}
				}
			}
		);
	} catch(e) {
		console.error(`Could not parse file name ${fileName}: `, e.message);
	}
});

fs.writeFileSync(
	'src/locale/po/template.pot',
	result.toString(),
	{ encoding: 'utf8' }
);
console.log(`Wrote ${result.items.length} extracted strings to src/locale/po/template.pot.\n`);
