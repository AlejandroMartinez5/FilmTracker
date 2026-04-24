const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/health", usersController.healthCheck);
router.get("/search", usersController.searchUsers);
router.get("/:username", usersController.getPublicProfileByUsername);

router.get("/profile", authenticateToken, usersController.getProfile);
router.put("/profile", authenticateToken, usersController.updateProfile);

module.exports = router;