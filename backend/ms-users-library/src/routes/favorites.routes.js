const express = require("express");
const router = express.Router();

const favoritesController = require("../controllers/favorites.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/", authenticateToken, favoritesController.addFavorite);
router.get("/", authenticateToken, favoritesController.getFavorites);
router.delete("/:tvmazeId", authenticateToken, favoritesController.removeFavorite);

module.exports = router;