const express = require('express')
const {registerAdmin, loginAdmin, logoutAdmin, profileAdmin} = require('../../controllers/AuthController/AdminController');
const { authenticateJWT } = require('../../middlewares/authMiddleware/authenticationMiddleware');
const router = express.Router()

router.post('/register-admin', registerAdmin);

router.post('/login-admin', loginAdmin);

router.post('/logout-admin', authenticateJWT, logoutAdmin);
router.get('/admin-profile', authenticateJWT, profileAdmin );

module.exports = router