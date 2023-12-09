const axios = require("axios");
const cheerio = require("cheerio");

async function fetchChuckNorrisJokes() {
  const url = "https://parade.com/968666/parade/chuck-norris-jokes/";
  return axios
    .get(url, {
      headers: {
        Referer: "https://parade.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      //   console.log(response);
      const jokes = [];
      $(
        "#phxdetail-1 > article > div > div.m-detail--contents.l-content-well > section > div.l-grid--content-body > div.m-detail--body > ol > li"
      ).each((index, element) => {
        jokes.push($(element).text().trim());
      });
      // console.log(jokes);
      return jokes;
    })
    .catch((error) => {
      console.error("Error fetching Chuck Norris jokes:", error.message);
      return [];
    });
}

module.exports = { fetchChuckNorrisJokes };
