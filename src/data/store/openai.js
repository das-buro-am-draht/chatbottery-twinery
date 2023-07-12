const { placeholders } = require('../../common/app/openai');

module.exports = {
  tags: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Erzeuge fünf Schlagworte zum Begriff \'${placeholders.tag}\' getrennt durch das Zeilentrennzeichen ('\\n')"\n    }]\n}`,
  phrases: `{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Formuliere drei Alternativen zum Text \'${placeholders.phrase}\' getrennt durch das Zeilentrennzeichen ('\\n')"\n    }]\n}`,
}