const axios = require('axios');

const termiiApiKey = process.env.TERMII_API_KEY || 'TLQvkk7mJcru5ajmXjD6BuEwrBPead7GNyltdUz9RZHpOEC9zfxlwbA6BqHjpn';
const termiiEndpoint = process.env.TERMII_ENDPOINT || 'https://api.ng.termii.com/api/sms/send';

async function sendWelcomeSMS(phoneNumber, message) {
    try {
        const response = await axios.post(
            termiiEndpoint,
            {
                api_key: termiiApiKey,
                to: phoneNumber,
                sms: message,
                from: "Dverse",
                type: "plain",
                channel: "generic"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error sending SMS:', error.response?.data || error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

async function createDeliverySMS(phoneNumber, message) {
    try {
        const response = await axios.post(
            termiiEndpoint,
            {
                api_key: termiiApiKey,
                to: phoneNumber,
                sms: message,
                from: "Dverse",
                type: "plain",
                channel: "generic"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('SMS sent successfully:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error sending SMS:', error.response?.data || error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

// Repeat this pattern for other functions...

module.exports = {
    sendWelcomeSMS,
    createDeliverySMS,
    // Add other functions here...
};
