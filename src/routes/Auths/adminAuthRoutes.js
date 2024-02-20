const express = require('express')
const {registerAdmin, loginAdmin, logoutAdmin, profileAdmin} = require('../../controllers/AuthController/AdminController');
const { verifyAccessToken } = require('../../helpers/jwt_helper')
const router = express.Router()

router.post('/register-admin', registerAdmin);

router.post('/login-admin', loginAdmin);

router.post('/logout-admin', verifyAccessToken, logoutAdmin);
router.get('/admin-profile', verifyAccessToken, profileAdmin );

module.exports = router