const admin = require("../../services/notification");
const Token = require("../../models/TokenModel");

async function registerToken(req, res) {
  const { token, userId } = req.body;

  try {
    await Token.findOneAndUpdate(
      { userId: userId },
      { token: token },
      { upsert: true }
    );
    res.status(200).send("Token registered successfully");
  } catch (error) {
    res.status(500).send("Error registering token: " + error);
  }
}

async function sendNotification(req, res) {
  const { title, body, userId } = req.body;

  try {
    const userToken = await Token.findOne({ userId: userId });
    if (!userToken) {
      return res.status(404).send("Token not found for the user");
    }

    const message = {
      notification: {
        title,
        body,
      },
      token: userToken.token,
    };

    const response = await admin.messaging().send(message);
    res.status(200).send("Notification sent successfully");
  } catch (error) {
    res.status(500).send("Error sending notification: " + error);
  }
}

async function sendNotificationToAll(req, res) {
  const { title, body } = req.body;

  try {
    const tokens = await Token.find({});
    const tokenList = tokens.map((doc) => doc.token);

    if (tokenList.length === 0) {
      return res.status(404).send("No tokens found");
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens: tokenList,
    };

    const response = await admin.messaging().sendMulticast(message);
    res
      .status(200)
      .send(
        `Notifications sent successfully to ${response.successCount} users`
      );
  } catch (error) {
    res.status(500).send("Error sending notifications: " + error);
  }
}

module.exports = {
  registerToken,
  sendNotification,
  sendNotificationToAll,
};
