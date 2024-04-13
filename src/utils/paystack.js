const axios = require('axios');
const { Config } = require('../config/config');

const PAYSTACK_SECRET_KEY = Config.paystackSecret;
const PAYSTACK_BASE_URL = Config.paystackBaseURL;

async function initializePayment(fullname, phone_number, amount, email, type, callback_url) {
    try {
        const response = await axios.post(
            PAYSTACK_BASE_URL + '/initialize',
            {
                amount,
                email,
                callback_url,
                metadata: {
                    fullname,
                    email,
                    phone_number,
                    type,
                    amount
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            data: { status: 500, message: 'Internal Server Error' }
        };
    }
}

async function initializeCompletePayment(facility_name, facility_id, phone_number, amount, email, type, callback_url) {
    try {
        const response = await axios.post(
            PAYSTACK_BASE_URL + '/initialize',
            {
                amount,
                email,
                callback_url,
                metadata: {
                    facility_id,
                    facility_name,
                    email,
                    phone_number,
                    type,
                    amount
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            data: { status: 500, message: 'Internal Server Error' }
        };
    }
}

async function initializeFacilityPayment(facility_name, phone_number, amount, email, type, callback_url) {
    try {
        const response = await axios.post(
            PAYSTACK_BASE_URL + '/initialize',
            {
                amount,
                email,
                callback_url,
                metadata: {
                    facility_name,
                    email,
                    phone_number,
                    type,
                    amount
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            data: { status: 500, message: 'Internal Server Error' }
        };
    }
}

async function verifyPayment(reference) {
    try {
        const response = await axios.get(
            PAYSTACK_BASE_URL + `/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            data: { status: 500, message: 'Internal Server Error' }
        };
    }
}

function extractReferenceFromRequest(req) {
    const reference = req.query.reference;
    return reference;
}

module.exports = {
    initializePayment,
    initializeCompletePayment,
    initializeFacilityPayment,
    verifyPayment,
    extractReferenceFromRequest
};
