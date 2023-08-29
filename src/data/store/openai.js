const { placeholders } = require('../../common/app/openai');

module.exports = {
  tags: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Erzeuge fünf Schlagworte zum Begriff \'${placeholders.tag}\'"\n    }]\n}`,
  phrases: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Formuliere drei Alternativen zum Text \'${placeholders.phrase}\' durch Zeilentrennzeichen (line feed '\\n') getrennt"\n    }]\n}`,
  page: `{\n    "model": "gpt-3.5-turbo-16k",\n    "messages": [{ \n      "role": "assistant",\n      "content": "HTML: '${placeholders.page}'\\nExtract relevant information from the provided HTML code for a keyword-based search index. Utilize text analysis and NLP techniques to understand and extract important information such as metadata, headings, visible text, alternative text for images, URLs, and linked content. Consider aspects like keywords, meta tags, titles, descriptions, categories, topics, author information, hierarchical structure of headings, link analysis, keyword density, semantic analysis, entity and concept recognition, sentiment analysis, multilingual support, timeliness and temporal relevance, as well as personalized and context-aware results.\\n` +
  `Please extract the following information from the provided HTML code and return it as valid JSON in English for indexing and enhancing search results:\\n` +
  `title: The title of the webpage.\\n` +
  `author: The author of the webpage.\\n` +
  `phrases: At least 10 search phrases that a user could enter to find this page, each enclosed in double quotation marks, separated by commas.\\n` +
  `main_keyword: The most important tag that describes the content (only one).\\n` +
  `keywords: At least 10 tags associated with the topic of the page, each enclosed in double quotation marks, separated by commas.\\n` +
  `image_url: The URL of the main image on the page.\\n` +
  `summary: A short summary of the page's content in one paragraph.\\n` +
  `date: The release date of the webpage.\\n` +
  `Preceding each line is an identifier (e.g., author). Don't change the wording of these identifiers and please provide the extracted information in a structured form as valid JSON in English."\n    }]\n}`,
}