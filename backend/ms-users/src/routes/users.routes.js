const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/upload.middleware");

router.get("/health", usersController.healthCheck);
router.get("/search", usersController.searchUsers);

router.get("/profile", authenticateToken, usersController.getProfile);
router.put("/profile", authenticateToken, usersController.updateProfile);
router.post(
  "/profile/photo",
  authenticateToken,
  uploadImage,
  usersController.uploadProfilePhoto
);

router.get("/id/:authId", usersController.getPublicProfileByAuthId);
router.get("/:username", usersController.getPublicProfileByUsername);

module.exports = router;
