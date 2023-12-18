const telegramBot = require("node-telegram-bot-api");
const { fetchChuckNorrisJokes } = require("./jokeFetcher");
const { translateText } = require("./translator");
const axios = require("axios");
const iso6391 = require("iso-639-1");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new telegramBot(BOT_TOKEN, { polling: true });
const ERRORS = {
  INVALID_LANGUAGE: "Please enter a valid language name",
  INVALID_COMMAND: "Please set your language using 'set language'",
  INVALID_JOKE_NUMBER: "Please enter a valid joke number between 1 and 101",
};
const userLanguagesCode = {};

function getLanguageCode(languageName) {
  const code = iso6391.getCode(languageName);
  return code || null;
}

async function handleSetLanguageInput(chatId, language) {
  const languageCode = getLanguageCode(language);
  userLanguagesCode[chatId] = languageCode;

  try {
    const translatedNoProblem = await translateText("no problem", languageCode);
    bot.sendMessage(chatId, `${translatedNoProblem}`);
  } catch (error) {
    throw new Error(ERRORS.INVALID_LANGUAGE);
  }
}

async function handleJokeRequest(chatId, jokeNumber) {
  const jokes = await fetchChuckNorrisJokes();
  if (jokeNumber < 1 || jokeNumber > 101) {
    const translatedError = await translateText(
      ERRORS.INVALID_JOKE_NUMBER,
      userLanguagesCode[chatId]
    );
    throw new Error(translatedError);
  }
  const selectedJoke = jokes[jokeNumber - 1];
  const translatedJoke = await translateText(
    selectedJoke,
    userLanguagesCode[chatId]
  );
  bot.sendMessage(chatId, `${jokeNumber}.${translatedJoke}`);
}

const isNumber = (userInput) => !isNaN(userInput);
const isMessageStartsWithSetLanguage = (userInput) =>
  userInput.toLowerCase().startsWith("set language");

bot.on("message", async (message) => {
  let chatId = message.from.id;
  if (message.text.toLowerCase() === "/start") {
    bot.sendMessage(
      chatId,
      "Welcome to Chuck Norris bot, to start please choose a language using 'set language'."
    );
    return;
  }
  try {
    if (isMessageStartsWithSetLanguage(message.text)) {
      const [, , language] = message.text.split(" ");
      if (!language) {
        throw new Error(ERRORS.INVALID_COMMAND);
      }
      await handleSetLanguageInput(chatId, language);
    } else if (isNumber(message.text)) {
      const jokeNumber = parseInt(message.text);
      await handleJokeRequest(chatId, jokeNumber, userLanguagesCode[chatId]);
    } else {
      if (message.text.toLowerCase().startsWith("set ")) {
        throw new Error(ERRORS.INVALID_COMMAND);
      } else {
        const translatedError = await translateText(
          ERRORS.INVALID_JOKE_NUMBER,
          userLanguagesCode[chatId]
        );
        throw new Error(translatedError);
      }
    }
  } catch (error) {
    bot.sendMessage(chatId, error.message);
  }
});
