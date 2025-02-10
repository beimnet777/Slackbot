const axios = require('axios');
const fs = require('fs');
const csvWriter = require('csv-writer');
const cron = require('node-cron');
require('dotenv').config({ path: '../.env' });

async function getAllUsers(token) {
    let users = [];
    let cursor = null;

    do {
        const response = await axios.get('https://slack.com/api/users.list', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                cursor: cursor
            }
        });

        if (response.data.ok) {
            users = users.concat(response.data.members);
            cursor = response.data.response_metadata?.next_cursor;
        } else {
            console.error('Error fetching users:', response.data.error);
            break;
        }
    } while (cursor);

    return users;
}

// Function to get all channels in the workspace
async function getAllChannels(token) {
    token = process.env.SLACK_USER_TOKEN;
    let channels = [];
    let cursor = null;

    do {
        const response = await axios.get('https://slack.com/api/conversations.list', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                types: 'public_channel,private_channel',
                cursor: cursor
            }
        });

        if (response.data.ok) {
            channels = channels.concat(response.data.channels);
            cursor = response.data.response_metadata?.next_cursor;
        } else {
            console.error('Error fetching channels:', response.data.error);
            break;
        }
        console.log(cursor);
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    } while (cursor);

    return channels;
}

// Function to write data to a CSV file
async function writeCSV(data, fileName) {
    const writer = csvWriter.createObjectCsvWriter({
        path: fileName,
        header: [
            { id: 'user_id', title: 'UserID' },
            { id: 'name', title: 'Name' }
        ]
    });

    await writer.writeRecords(data);
    console.log(`CSV file '${fileName}' created successfully.`);
}

async function getChannelMembers(token, channelId) {
    try {
        const response = await axios.get('https://slack.com/api/conversations.members', {
            headers: { Authorization: `Bearer ${token}` },
            params: { channel: channelId }
        });

        return response.data.ok ? response.data.members : [];
    } catch (error) {
        console.error(`Error fetching members for channel ${channelId}:`, error);
        return [];
    }
}


async function getUsersAndTheirChannels(token, filePath) {
    console.log(token, filePath);
    try {
        // Get all users in the workspace
        const users = await getAllUsers(token);
        console.log(users);
        console.log(users.length);
        console.log("***********************888");
        
        // Get all channels in the workspace
        const channels = await getAllChannels(token);
        console.log(channels);
        console.log(channels.length);
        console.log("***********************888");

        // Convert users list to a set for fast lookup
        const userIdSet = new Set(users.map(user => user.id));
        

        const userChannelData = [];

        //Loop through channels with numeric names
        for (const user of users) {
            if (true) { 

                userChannelData.push({
                    user_id: user.id,
                    name: user.profile.real_name
                });

            }
        }

        // Step 6: Write the results to a CSV file
        await writeCSV(userChannelData, filePath);
    } catch (error) {
        console.error('Error:', error);
    }
}

token = process.env.SLACK_BOT_TOKEN
filePath = "../employeeId.csv";

getUsersAndTheirChannels(token, filePath);
