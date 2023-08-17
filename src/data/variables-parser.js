module.exports = (text) => {

	const variables = {};

	for (const match of text.matchAll(/<wait\s[^>]*\bvar="(\$[^\s"]+)"[^>]*>/gmi)) {
		const variable = match[1];
		if (variable && !variables[variable]) {
			variables[variable] = {
				type: 'string',
				value: '',
				auto: true,
			};
		}
	}
	for (const match of text.matchAll(/<msg\s[^>]*\beval="(\$[^"]+)"[^>]*>/gmi)) {
		if (match[1]) {
			const m = match[1].match(/(\$[^\s=]+)\s*=\s*(\S*)/m);
			const variable = m[1];
			const assignmt = m[2];
			if (variable && assignmt && !variables[variable]) {
				let type = 'string';
				let value = '';
				if (!assignmt.startsWith('\'')) {
					if (/^(true|false)$/i.test(assignmt)) {
						type = 'boolean';
						value = false;
					} else if (/^[0-9\.,]+$/.test(assignmt)) {
						type = 'number';
						value = null;
					} else if (/\bdate\b/i.test(assignmt)) {
						type = 'date';
						value = null;
					}
				}
				variables[variable] = {
					type,
					value,
					auto: true,
				};
			}
		}
	}

	return variables;
}