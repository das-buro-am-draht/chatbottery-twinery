const { placeholders } = require('../../common/app/openai');

module.exports = {
  tags: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Erzeuge fünf Schlagworte zum Begriff \'${placeholders.tag}\'"\n    }]\n}`,
  phrases: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Formuliere drei Alternativen zum Text \'${placeholders.phrase}\' durch Zeilentrennzeichen (line feed '\\n') getrennt"\n    }]\n}`,
  page: `{\n    "model": "gpt-3.5-turbo-16k",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Extract relevant information from the provided HTML code for a keyword-based search index. Utilize text analysis and NLP techniques to understand and extract important information such as metadata, headings, visible text, alternative text for images, URLs, and linked content. Consider aspects like keywords, meta tags, titles, descriptions, categories, topics, author information, hierarchical structure of headings, link analysis, keyword density, semantic analysis, entity and concept recognition, sentiment analysis, multilingual support, timeliness and temporal relevance, as well as personalized and context-aware results.\\nPlease extract the following information from the provided HTML code and return it as valid JSON for indexing and enhancing search results:\\nauthor: The author of the webpage.\\nphrases: At least 10 search phrases that a user could enter to find this page, each enclosed in double quotation marks, separated by commas.\\nmain_keyword: The most important tag that describes the content (only one).\\nkeywords: At least 10 tags associated with the topic of the page, each enclosed in double quotation marks, separated by commas.\\nsummary: A short summary of the page's content in one paragraph.\\ndate: The release date of the webpage.\\nPreceding each line is an identifier (e.g., author). Don't change the wording of these identifiers and please provide the extracted information in a structured form as valid JSON.\\nHTML code: '${placeholders.page}'"\n    }]\n}`,
  prompt: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "${placeholders.prompt}"\n    }]\n}`,
}