const axios = require('axios');
const fs = require('fs');
const csvWriter = require('csv-writer');

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
            console.
            cursor = response.data.response_metadata?.next_cursor;
        } else {
            console.error('Error fetching channels:', response.data.error);
            break;
        }
    } while (cursor);

    return channels;
}

// Function to write data to a CSV file
async function writeCSV(data, fileName) {
    const writer = csvWriter.createObjectCsvWriter({
        path: fileName,
        header: [
            { id: 'user_id', title: 'User ID' },
            { id: 'channel', title: 'Channel' }
        ]
    });

    await writer.writeRecords(data);
    console.log(`CSV file '${fileName}' created successfully.`);
}


async function getUsersAndTheirChannels(token) {
    try {
        // Get all users in the workspace
        const users = await getAllUsers(token);
        
        // Get all channels in the workspace
        const channels = await getAllChannels(token);

        // Convert users list to a set for fast lookup
        const userIdSet = new Set(users.map(user => user.id));

        const userChannelData = [];

        //Loop through channels with numeric names
        for (const channel of channels) {
            if (/^\d+$/.test(channel.name)) {  // Channel name is a number

                //  Get members of the current channel
                const members = await getChannelMembers(token, channel.id);

                // For each member, check if their user ID is in the userIdSet
                members.forEach(memberId => {
                    if (userIdSet.has(memberId)) {
                        // If user is part of the channel, match them and add data
                            userChannelData.push({
                                user_id: memberId,
                                channel: channel.name
                            });
                        
                    }
                });
            }
        }

        // Step 6: Write the results to a CSV file
        await writeCSV(userChannelData, 'user_channels.csv');
    } catch (error) {
        console.error('Error:', error);
    }
}