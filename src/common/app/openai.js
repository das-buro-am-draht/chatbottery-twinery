const apikey = 'RsCsGSeRfwlZYh21fhJNXrMsStRWRSyDBF8CjTNoLELL9';
const host = 'https://proxy.chatbottery.com';

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

module.exports = { openai };