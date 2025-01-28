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
    const cleanedMessage = userMessage.replace(/<@[\w]+>/g, '').trim();
    console.log(cleanedMessage);

    const payload = {
      message: cleanedMessage,
    };

    const config = {
      method: 'post',
      url: process.env.GPT_BOT_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    };

    console.log("=== Debugging Axios Request ===");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("Request Config:", JSON.stringify(config, null, 2));

    const response = await axios(config);
    responseData = response.data;
    console.log(responseData)

  
    const botReply = responseData.response; 

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
    await client.chat.postMessage({
      channel: event.channel, // Use the channel ID from the event
      text: "Sorry, I couldn't process that!",
    });
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
