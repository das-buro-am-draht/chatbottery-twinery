const { isValidUrl, trim } = require('../../utils/common');

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
		if (!response.ok) {
			switch (response.status) {
				case 401:
					throw new Error('Invalid authentication.');
				case 429:
					throw new Error('Rate limit reached - Please try again later.');
				case 503:
					throw new Error('The engine is currently overloaded, please try again later');
			}
		}
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

const absUrl = (host, path) => {
	if (isValidUrl(path)) {
		return path;
	}
	const url = new URL(host);
	let uri = url.protocol + '//' + url.host;
	if (path.startsWith('/')) {
		return uri + path;
	} else {
		const pathname = String(url.pathname);
		return uri + pathname.substring(0, pathname.lastIndexOf('/')) + '/' + path;
	}
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
			let text;
			const doc = new DOMParser().parseFromString(html, 'text/html');
			if (doc.body && doc.body.innerText) {
				text = trim(doc.body.innerText);
			}
			if (!text) {
				text = html
				// .replace(/<style[^>]*>[^<]*<\/style>/g, '')
				// .replace(/<script[^>]*>[^<]*<\/script>/g, '')
				.replace(/<!--[\s\S]*-->/g, '')
				.replace(/[\r\n]/g, '')  // remove CR/LF
				.replace(/\s\s+/g, ' '); // remove multiple white spaces
			}
			const data = getData(params, placeholders.page, text);
			return openai(data).then((response) => {
				if (response.choices) {
					const [choice] = response.choices;
					if (choice.finish_reason === 'length') {
						throw new Error('Maximum number of tokens was reached.')
					}
					if (choice.message && choice.message.content) {
						const start = choice.message.content.indexOf('{');
						const end = choice.message.content.lastIndexOf('}');
						if (start >= 0 && start < end) {
							const json = JSON.parse(choice.message.content.substring(start, end + 1));
							if (!json.image_url && doc.body) {
								const ignore = ['svg','ico'];
								const images = doc.body.querySelectorAll('img');
								for (let i = 0; i < images.length; i++) {
									const image = images[i];
									if (image.hasAttribute('src')) {
										const src = image.getAttribute('src');
										json.image_url = absUrl(url, src);
										if (!ignore.some((type) => src.endsWith(`.${type}`))) {
											break;
										}
									}
								}
							}
							if (!json.title && doc.head) {
								const element = doc.head.querySelector('title');
								if (element) {
									json.title = trim(element.innerText);
								}
							}
							return json;
						}
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