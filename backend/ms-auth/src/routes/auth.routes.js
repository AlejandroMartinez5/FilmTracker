const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middlewares");

router.get("/health", controller.healthCheck);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/verify-email", controller.verifyEmail);
router.post("/resend-verification", controller.resendVerificationEmail);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.put("/change-password", authMiddleware, controller.changePassword);

module.exports = router;
