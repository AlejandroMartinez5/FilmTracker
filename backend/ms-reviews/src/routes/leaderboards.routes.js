const express = require("express");
const leaderboardsController = require("../controllers/leaderboards.controller");
const { optionalAuthenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/users", optionalAuthenticateToken, leaderboardsController.getTopUsers);
router.get("/reviews", optionalAuthenticateToken, leaderboardsController.getTopReviews);
router.get("/comments", optionalAuthenticateToken, leaderboardsController.getTopComments);

module.exports = router;
