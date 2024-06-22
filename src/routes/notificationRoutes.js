const express = require("express");
const {
  registerToken,
  sendNotification,
  sendNotificationToAll,
} = require("../controllers/NotificationController/notificationController");
const router = express.Router();

router.post("/register-token", registerToken);
router.post("/send-notification", sendNotification);
router.post("/send-notification-all", sendNotificationToAll);

module.exports = router;
