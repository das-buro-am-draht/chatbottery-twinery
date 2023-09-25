const host = () => localStorage.getItem('DEV_ENV') === 'true' ? 'http://chatbot.proxy/' : 'https://proxy.chatbottery.com/';

module.exports = { 
	proxy: {
		openai: () => host() + 'openai?apikey=RsCsGSeRfwlZYh21fhJNXrMsStRWRSyDBF8CjTNoLELL9',
		fetch: () => host() + 'fetch?apikey=gKo86o8F769Bfi879tzht87BRjhcg24cj1hcjvgv345109t3',
	},
}