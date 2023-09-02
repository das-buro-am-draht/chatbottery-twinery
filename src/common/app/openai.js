const apikey = {
	fetch: 'gKo86o8F769Bfi879tzht87BRjhcg24cj1hcjvgv345109t3',
	openai: 'RsCsGSeRfwlZYh21fhJNXrMsStRWRSyDBF8CjTNoLELL9',
};
const host = localStorage.getItem('DEV_ENV') === 'true'
           ? 'http://chatbot.proxy'
           : 'https://proxy.chatbottery.com';

const openai = (data) => {
  const url = `${host}/openai?apikey=${apikey.openai}`;
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then((response) => {
		return response.json().then((json) => {
	   	if (!response.ok) {
				let message = 'Error on invoking openAI';
				if (json.error && json.error.message) {
					message = json.error.message;
				}
				throw new Error(`${message} - HTTP-Status: ${response.status}`);
			}
			return json;
		});
  	});
};

const placeholders = {
	tag: '%TAG%',
	phrase: '%PHRASE%',
	page: '%HTML%',
};

const getData = (params, placeholder, text) => {
	const placeholders = { [placeholder]: text };
	const data = JSON.parse(params);
	if (data.messages && data.messages.length > 0) {
		data.messages = data.messages.map(message => {
			if (message.content) {
				message.content = message.content.replace(/%\w+%/g, (placeholder) => placeholders[placeholder] || placeholder);
			}
			return message;
		});
	}
	return data;
}

const suggestions = (params, placeholder, text, delimiter) => {
	const data = getData(params, placeholder, text);
	return openai(data).then((response) => {
		const suggestions = [];
		if (response.choices) {
			response.choices.forEach((choice) => {
				if (choice.message && typeof choice.message.content === 'string') {
					choice.message.content.split(new RegExp(`[${delimiter}]`)).forEach(text => {
						const suggestion = text.replace(/^[\n\r\s-\d\.\)]+/, '').replace(/[\n\r\s]+$/, '');
						if (suggestion) {
							suggestions.push(suggestion);
						}
					});
				}
			});
		}
		return suggestions;
	});
};

const pageAnalysis = (params, url) => {
	const requestUrl = `${host}/fetch?apikey=${apikey.fetch}&url=${encodeURIComponent(url)}`;
	return fetch(requestUrl)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Error on calling '${url} - HTTP-Status: ${response.status}`);
			}
			return response.text();
		})
		.then((html) => {
			const htmlCode = html
			// .replace(/<style[^>]*>[^<]*<\/style>/g, '')
			// .replace(/<script[^>]*>[^<]*<\/script>/g, '')
			// .replace(/<!--.*-->/g, '')
			.replace(/[\r\n]/g, '')  // remove CR/LF
			.replace(/\s\s+/g, ' '); // remove multiple white spaces
			const data = getData(params, placeholders.page, htmlCode);
			return openai(data).then((response) => {
				if (response.choices) {
					const [choice] = response.choices;
					if (choice.message && choice.message.content) {
						return JSON.parse(choice.message.content);
					}
				}
				throw new Error('Unexpected result from openAI.');
			});
		});
};

module.exports = { 
	openai, 
	placeholders,
	tagSuggestions: (params, text, delimiter = ',\n') => suggestions(params, placeholders.tag, text, delimiter), 
	phraseSuggestions: (params, text, delimiter = '\n') => suggestions(params, placeholders.phrase, text, delimiter),
	pageAnalysis,
};