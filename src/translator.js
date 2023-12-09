const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

async function translateText(inputText, targetLanguage) {
  const apiKey = process.env.AZURE_KEY;
  const endpoint = "https://api.cognitive.microsofttranslator.com";
  let params = new URLSearchParams();
  params.append("api-version", "3.0");
  params.append("from", "en");
  params.append("to", targetLanguage);

  const response = await axios({
    baseURL: endpoint,
    url: "/translate",
    method: "post",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-type": "application/json",
      "X-ClientTraceId": uuidv4().toString(),
    },
    params: params,
    data: [
      {
        text: inputText,
      },
    ],
    responseType: "json",
  });
  return response.data[0].translations[0].text;
}

module.exports = { translateText };
