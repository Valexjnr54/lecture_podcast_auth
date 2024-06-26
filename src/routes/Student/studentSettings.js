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
} = require("../../controllers/StudentController/studentSettingsController");
const { upload } = require("../../middlewares/multerMiddleware");
const settingStudentRouter = express.Router();

settingStudentRouter.post("/change-password", authenticateJWT, changePassword);
settingStudentRouter.post(
  "/change-profile-image",
  authenticateJWT,
  upload.single("profile_image"),
  changeProfileImage
);
settingStudentRouter.post("/update-details", authenticateJWT, updateDetails);
settingStudentRouter.post("/forgot-password", forgotPassword);
settingStudentRouter.put("/reset-password/:resetToken", resetPassword);

module.exports = settingStudentRouter;
