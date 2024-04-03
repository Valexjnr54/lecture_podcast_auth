const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/../../.env" });

const Config = {
  Jwt_secret: process.env.JWT_SECRET,
  secret: process.env.JWT_SECRET,
  corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN,
  port: process.env.PORT,
  appRootURL: process.env.APP_ROOT_URL || "http://localhost:5473",
};

const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465", 10),
  secure: process.env.EMAIL_SECURE === "true" || false,
  auth: {
    user: process.env.EMAIL_USER || "qmarthub@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "fukpospayyoomzlv",
  },
};

const cloudinaryConfig = {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

module.exports = {
  Config,
  emailConfig,
  cloudinaryConfig,
};
