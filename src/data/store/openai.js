module.exports = {
  tags: '{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Erzeuge fünf Schlagworte zum Begriff \'%TAG%\'"\n    }]\n}',
  alts: '{\n    "model": "gpt-3.5-turbo",\n    "messages": [{ \n      "role": "assistant",\n      "content": "Formuliere drei Alternativen zum Text \'%PHRASE%\'"\n    }]\n}',
}