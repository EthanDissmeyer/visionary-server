const OpenAi = require("openai");

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;