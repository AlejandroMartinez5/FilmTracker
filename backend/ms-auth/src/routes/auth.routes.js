const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.get("/health", controller.healthCheck);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/verify-email", controller.verifyEmail);
router.post("/resend-verification", controller.resendVerificationEmail);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

module.exports = router;
