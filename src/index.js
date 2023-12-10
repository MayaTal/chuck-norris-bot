const telegramBot = require("node-telegram-bot-api");
const { fetchChuckNorrisJokes } = require("./jokeFetcher");
const { translateText } = require("./translator");
const iso6391 = require("iso-639-1");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const bot = new telegramBot(TOKEN, { polling: true });
const userLanguagesCode = {};

function getLanguageCode(languageName) {
  const code = iso6391.getCode(languageName);
  return code || null;
}

async function setLanguageAccordinginput(chatId, language) {
  const languageCode = getLanguageCode(language);
  userLanguagesCode[chatId] = languageCode;

  try {
    const translatedNoProblem = await translateText("no problem", languageCode);
    bot.sendMessage(chatId, `${translatedNoProblem}`);
  } catch (error) {
    bot.sendMessage(chatId, "Please enter a valid language name");
  }
}

async function handleJokeRequest(chatId, jokeNumber) {
  const jokes = await fetchChuckNorrisJokes();

  if (jokeNumber < 1 || jokeNumber > 101) {
    const translatedError = await translateText(
      "Please enter a valid joke number between 1 and 101",
      userLanguagesCode[chatId]
    );
    bot.sendMessage(chatId, translatedError);
  } else {
    const selectedJoke = jokes[jokeNumber - 1];
    const translatedJoke = await translateText(
      selectedJoke,
      userLanguagesCode[chatId]
    );
    bot.sendMessage(chatId, `${jokeNumber}.${translatedJoke}`);
  }
}

bot.on("message", async (message) => {
  let chatId = message.from.id;
  try {
    if (message.text.toLowerCase().startsWith("set language")) {
      const [, , language] = message.text.split(" ");
      if (!language) {
        throw new Error("Please set your language using 'set language'");
      }
      await setLanguageAccordinginput(chatId, language);
    } else if (!isNaN(message.text)) {
      const jokeNumber = parseInt(message.text);
      handleJokeRequest(chatId, jokeNumber, userLanguagesCode[chatId]);
    } else {
      if (message.text.toLowerCase().startsWith("set ")) {
        throw new Error("Please set your language using 'set language'");
      } else {
        const translatedError = await translateText(
          "Please enter a valid joke number between 1 and 101",
          userLanguagesCode[chatId]
        );
        throw new Error(translatedError);
      }
    }
  } catch (error) {
    bot.sendMessage(chatId, error.message);
  }
});
