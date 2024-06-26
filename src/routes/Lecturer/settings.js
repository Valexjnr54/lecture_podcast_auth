const express = require("express");
const {
  authenticateJWT,
} = require("../../middlewares/authMiddleware/authenticationMiddleware");
const {
  changePassword,
  changeProfileImage,
  updateDetails,
  forgotPassword,
  resetPassword,
} = require("../../controllers/LecturerController/SettingsController");
const { upload } = require("../../middlewares/multerMiddleware");
const settingLecturerRouter = express.Router();

settingLecturerRouter.post("/change-password", authenticateJWT, changePassword);
settingLecturerRouter.post(
  "/change-profile-image",
  authenticateJWT,
  upload.single("profile_image"),
  changeProfileImage
);
settingLecturerRouter.post("/update-details", authenticateJWT, updateDetails);
settingLecturerRouter.post("/forgot-password", forgotPassword);
settingLecturerRouter.put("/reset-password/:resetToken", resetPassword);

module.exports = settingLecturerRouter;
