const express = require('express')
const {registerStudent, loginStudent,logoutStudent,profileStudent} = require('../../controllers/AuthController/StudentController');
const { verifyAccessToken } = require('../../helpers/jwt_helper')
const router = express.Router()

router.post('/register-student', registerStudent);

router.post('/login-student', loginStudent);

router.post('/logout-student', verifyAccessToken, logoutStudent);
router.get('/student-profile', verifyAccessToken, profileStudent );

module.exports = router