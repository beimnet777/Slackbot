const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

// Initialize ExpressReceiver for Slack
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initialize Slack app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver, // Use the custom ExpressReceiver
});

// Add a custom route to handle Slack URL verification
receiver.router.post('/slack/events', (req, res) => {
  if (req.body.type === 'url_verification') {
    res.status(200).send(req.body.challenge); // Respond with the challenge
  } else {
    res.status(404).send('Not Found'); // Handle other types of requests (optional)
  }
});

// Listen for mentions in Slack
slackApp.event('app_mention', async ({ event, say }) => {
  console.log('Received app_mention event:');
  try {
    console.log(userMessage)
    const userMessage = event.text;

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
    const botReply = "Test Purpose message"

    // Send response to Slack
    await say(botReply);
  } catch (error) {
    console.error('Error processing app mention:', error);
    await say("Sorry, I couldn't process that!");
  }
});

// Start the app
(async () => {
  const port = process.env.PORT || 3000;

  // Start the Slack app with the ExpressReceiver
  await slackApp.start(port);
  console.log(`⚡️ Slack app is running on port ${port}`);
})();
