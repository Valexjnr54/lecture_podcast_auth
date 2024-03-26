const express = require('express')
const { authenticateJWT } = require('../../middlewares/authMiddleware/authenticationMiddleware')
const { changePassword, changeProfileImage, updateDetails } = require('../../controllers/AdminController/adminSettingsController')
const {upload} = require('../../middlewares/multerMiddleware')
const settingAdminRouter = express.Router()

settingAdminRouter.post('/change-password', authenticateJWT, changePassword);
settingAdminRouter.post('/change-profile-image', authenticateJWT, upload.single('profile_image'), changeProfileImage);
settingAdminRouter.post('/update-details', authenticateJWT, updateDetails);

module.exports = settingAdminRouter