const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listen for mentions
app.event('app_mention', async ({ event, say }) => {
  try {
    const userMessage = event.text;

    // Call OpenAI API
    const response = await axios.post(
        process.env.GPT_URL,
      {
        model: process.env.MODEL_ID,
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const botReply = response.data.choices[0].message.content;

    // Send response to Slack
    await say(botReply);
  } catch (error) {
    console.error(error);
    await say("Sorry, I couldn't process that!");
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ ChatGPT app is running!');
})();
