const express = require('express')
const {registerLecturer, loginLecturer, logoutLecturer, profileLecturer} = require('../../controllers/AuthController/LecturerController');
const { authenticateJWT } = require('../../middlewares/authMiddleware/authenticationMiddleware');
const router = express.Router()

// LecturerAuthRouter.post('/register-lecturer', registerLecturer);
router.post('/register-lecturer', registerLecturer);

router.post('/login-lecturer', loginLecturer);

router.post('/logout-lecturer', authenticateJWT, logoutLecturer);
router.get('/lecturer-profile', authenticateJWT, profileLecturer );

module.exports = router