const telegramBot = require("node-telegram-bot-api");
const { fetchChuckNorrisJokes } = require("./jokeFetcher");
require("dotenv").config();

const TOKEN = process.env.TOKEN;

const bot = new telegramBot(TOKEN, { polling: true });

bot.on("message", async (message) => {
  console.log(message.text);
  let chat_id = message.from.id;

  const chuckNorrisJokes = await fetchChuckNorrisJokes();
});
