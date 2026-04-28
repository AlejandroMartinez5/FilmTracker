const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/health", usersController.healthCheck);
router.get("/search", usersController.searchUsers);

router.get("/profile", authenticateToken, usersController.getProfile);
router.put("/profile", authenticateToken, usersController.updateProfile);

router.get("/:username", usersController.getPublicProfileByUsername);

module.exports = router;