const admin = require('firebase-admin');

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendDeliveryPushNotification(token, title, body, delivery_id) {
    try {
      const message = {
        token: token,
        notification: {
          title,
          body
        },
        data:{
          delivery_id:delivery_id.toString()
        }
      };
  
      const response = await admin.messaging().send(message);
      console.log('Successfully sent status: , message:', response);
    } catch (error) {
      console.error('Error sending status: , message:', error);
    }
}

module.exports = {
    sendDeliveryPushNotification
};
