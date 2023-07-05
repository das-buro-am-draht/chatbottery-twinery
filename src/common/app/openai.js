const apikey = 'RsCsGSeRfwlZYh21fhJNXrMsStRWRSyDBF8CjTNoLELL9';
const host = localStorage.getItem('DEV_ENV') === 'true'
           ? 'http://chatbot.proxy'
           : 'https://proxy.chatbottery.com';

const openai = (data) => {
  const url = host + '/openai?apikey=' + apikey;
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Error on invoking openAI - HTTP-Status: ${response.status}`);
    }
    return response.json();
  });
}

const placeholders = {
  tag: '%TAG%',
  phrase: '%PHRASE%',
}

const suggestions = (params, placeholder, text) => {
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
  return openai(data).then((response) => {
    const suggestions = [];
    if (response.choices) {
      response.choices.forEach(choice => {
        if (choice.message && typeof choice.message.content === 'string') {
          choice.message.content.split(/[\n]/).forEach(text => {
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
}

module.exports = { 
  openai, 
  placeholders,
  tagSuggestions: (params, text) => suggestions(params, placeholders.tag, text), 
  phraseSuggestions: (params, text) => suggestions(params, placeholders.phrase, text), 
};