const express = require("express");
const {
  registerStudent,
  loginStudent,
  logoutStudent,
  profileStudent,
  verifyEmail,
  resendVerificationEmail,
} = require("../../controllers/AuthController/StudentController");
const {
  authenticateJWT,
} = require("../../middlewares/authMiddleware/authenticationMiddleware");
const router = express.Router();

router.post("/register-student", registerStudent);

router.post("/login-student", loginStudent);

router.post("/logout-student", authenticateJWT, logoutStudent);
router.get("/student-profile", authenticateJWT, profileStudent);

router.get("/student/verify-email", verifyEmail);

router.post("/student/resend-verification-email", resendVerificationEmail);

module.exports = router;
