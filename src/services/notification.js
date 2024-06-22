const admin = require("firebase-admin");
const serviceAccount = require("../../service.json");

// const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
