const telegramBot = require("node-telegram-bot-api");
const { fetchChuckNorrisJokes } = require("./jokeFetcher");
const { translateText } = require("./translator");
require("dotenv").config();

const TOKEN = process.env.TOKEN;

const bot = new telegramBot(TOKEN, { polling: true });
const userLanguages = {};

bot.on("message", async (message) => {
  console.log(message.text);
  let chatId = message.from.id;

  if (message.text.toLowerCase().startsWith("set language")) {
    const [, , language] = message.text.split(" ");
    if (language) {
      userLanguages[chatId] = language.toLowerCase();
      try {
        const translatedNoProblem = await translateText("no problem", language);
        bot.sendMessage(
          chatId,
          `Language set to: ${language}\n${translatedNoProblem}`
        );
      } catch (error) {
        console.error("Error translating text:", error.message);
        bot.sendMessage(chatId, `Error translating text`);
      }
    } else {
      bot.sendMessage(chatId, "Please specify a language after 'set language'");
    }
  } else if (!isNaN(message.text)) {
    const jokeNumber = parseInt(message.text);
    const language = userLanguages[chatId]; // Retrieve the user's language

    if (language) {
      const jokes = await fetchChuckNorrisJokes();

      if (jokeNumber >= 1 && jokeNumber <= 101) {
        const selectedJoke = jokes[jokeNumber - 1];
        const translatedJoke = await translateText(selectedJoke, language);

        bot.sendMessage(chatId, `${translatedJoke}`);
      } else {
        bot.sendMessage(
          chatId,
          "Please enter a valid joke number between 1 and " + jokes.length
        );
      }
    } else {
      bot.sendMessage(chatId, "Please set your language using 'set language'");
    }
  } else {
    bot.sendMessage(
      chatId,
      "Please enter a number to get a Chuck Norris joke, or set your language using 'set language'"
    );
  }
});
