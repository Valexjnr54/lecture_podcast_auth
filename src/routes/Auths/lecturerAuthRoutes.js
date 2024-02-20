const express = require('express')
const {registerLecturer, loginLecturer, logoutLecturer, profileLecturer} = require('../../controllers/AuthController/LecturerController');
const { verifyAccessToken } = require('../../helpers/jwt_helper')
const router = express.Router()

// LecturerAuthRouter.post('/register-lecturer', registerLecturer);
router.post('/register-lecturer', registerLecturer);

router.post('/login-lecturer', loginLecturer);

router.post('/logout-lecturer', verifyAccessToken, logoutLecturer);
router.get('/lecturer-profile', verifyAccessToken, profileLecturer );

module.exports = router