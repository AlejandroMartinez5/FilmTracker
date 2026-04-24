const express = require("express");
const router = express.Router();

const watchlistController = require("../controllers/watchlist.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/", authenticateToken, watchlistController.add);
router.get("/", authenticateToken, watchlistController.getByUser);
router.delete("/:tvmazeId", authenticateToken, watchlistController.remove);
router.get("/:tvmazeId/check", authenticateToken, watchlistController.check);

module.exports = router;