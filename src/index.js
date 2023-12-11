const telegramBot = require("node-telegram-bot-api");
const { fetchChuckNorrisJokes } = require("./jokeFetcher");
const { translateText } = require("./translator");
const axios = require("axios");
const iso6391 = require("iso-639-1");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_ADDRESS = "https://chuck-norris-bot.azurewebsites.net";
// async function setWebhook() {
//   const response = await axios.post(
//     `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
//     {
//       url: WEBHOOK_ADDRESS,
//     }
//   );

//   console.log(response.data);
// }

// setWebhook();
const bot = new telegramBot(BOT_TOKEN, { polling: true });
const userLanguagesCode = {};
const ERRORS = {
  INVALID_LANGUAGE: "Please enter a valid language name",
  INVALID_COMMAND: "Please set your language using 'set language'",
  INVALID_JOKE_NUMBER: "Please enter a valid joke number between 1 and 101",
};

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
