const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

// Initialize Slack app in Socket Mode
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN, // Bot token
  appToken: process.env.SLACK_APP_TOKEN, // Socket Mode token
  socketMode: true, // Enable Socket Mode
});

// Listen for mentions in Slack
slackApp.event('app_mention', async ({ event, say }) => {
  console.log("************")
  console.log('Received app_mention event:');
  try {
    const userMessage = event.text;
    console.log(userMessage);

    // Call OpenAI API
    // const response = await axios.post(
    //   process.env.GPT_URL,
    //   {
    //     model: process.env.MODEL_ID,
    //     messages: [{ role: 'user', content: userMessage }],
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );

    // const botReply = response.data.choices[0].message.content;
    const botReply = 'Thank you very much'

    // Send response to Slack
    await say(botReply);
  } catch (error) {
    console.error('Error processing app mention:', error);
    await say("Sorry, I couldn't process that!");
  }
});

// Start the app
(async () => {
  await slackApp.start();
  console.log('⚡️ Slack app is running in Socket Mode!');
})();
