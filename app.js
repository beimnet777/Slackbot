const { App } = require('@slack/bolt');
const axios = require('axios');
const express = require('express');
require('dotenv').config();

// Initialize Slack app in Socket Mode
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN, // Bot token
  appToken: process.env.SLACK_APP_TOKEN, // Socket Mode token
  socketMode: true, // Enable Socket Mode
});

// Creating dummy port for render purpose
const app = express();
const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send('Dummy server running');
});

// Start the dummy server
app.listen(port, () => {
  console.log(`Dummy HTTP server running on port ${port}`);
});

// Listen for mentions in Slack
slackApp.event('app_mention', async ({ event, client }) => {
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
    
    console.log('Message is in a Channel. Sending reply...***');
    // Message is in a channel
    await client.chat.postMessage({
      channel: event.channel, // Use the channel ID from the event
      text: botReply,
    });
    
    // await say(botReply);
  } catch (error) {
    console.error('Error processing app mention:', error);
    await say("Sorry, I couldn't process that!");
  }
});


slackApp.event('message', async ({ event, client }) => {
    console.log('Received DM:', event);
    try {
      const userMessage = event.text;
      console.log(`User sent a DM: ${userMessage}`);

      // Call OpenAI API or process the message
      const botReply = "Hi! I'm here to help with your DM.";

      // Send a response in the DM
      await client.chat.postMessage({
        channel: event.channel,
        text: botReply,
      });
    } catch (error) {
      console.error('Error handling DM:', error);
    }
  
});

// Start the app
(async () => {
  await slackApp.start();
  console.log('⚡️ Slack app is running in Socket Mode!');
})();
