const { App } = require('@slack/bolt');
const axios = require('axios');
const express = require('express');
require('dotenv').config();
const fs = require('fs');
const csvParser = require('csv-parser');

let userDict = {};

// Utility function to read a CSV file and return an array of rows
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function mergeCsvs(file) {
    // Read both CSV files
    const data = await readCSV(file); // expected columns: name, id
    console.log(data)

    data.forEach(row => {
      if (row.Name) {
        console.log("*")
        userDict[row.Slack_ID] = row.ID;
      }
    });
    console.log(userDict, "************")
  }

  mergeCsvs('merged.csv')
    



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

setInterval(() => {
  axios.get("https://chatbot-wo06.onrender.com")
      .catch(error => {
          console.error("Error making request:", error.message);
      });
}, 10 * 60 * 1000);
// Start the dummy server
app.listen(port, () => {
  
  console.log(`Dummy HTTP server running on port ${port}`);
});

// Listen for mentions in Slack
slackApp.event('app_mention', async ({ event, client }) => {
  console.log('Received app_mention event:');
  try {
    console.log(userDict);
    const userMessage = event.text;
    const userSlackId = event.user; // Get Slack user ID from event
    const userId = userDict[userSlackId] || 'Unknown'; // Lookup ID

    const addMessage = `And for the record my id is, ${userId}!`
    const cleanedMessage = userMessage.replace(/<@[\w]+>/g, '').trim();

    console.log(cleanedMessage, addMessage  );

    const payload = {
      message: cleanedMessage + addMessage,
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



// Start the app
(async () => {
  await slackApp.start();
  console.log('⚡️ Slack app is running in Socket Mode!');
})();
