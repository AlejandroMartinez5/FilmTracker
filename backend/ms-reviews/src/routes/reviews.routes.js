const express = require("express");
const reviewsController = require("../controllers/reviews.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authenticateToken, reviewsController.createReview);

router.get("/show/:tvmazeId", reviewsController.getReviewsByShow);

router.get("/user/:authId", reviewsController.getReviewsByUser);

router.get("/:reviewId/likes", reviewsController.getReviewLikes);

router.put("/:reviewId", authenticateToken, reviewsController.updateReview);

router.delete("/:reviewId", authenticateToken, reviewsController.deleteReview);

router.post("/:reviewId/like", authenticateToken, reviewsController.likeReview);

router.delete(
  "/:reviewId/like",
  authenticateToken,
  reviewsController.unlikeReview
);

module.exports = router;