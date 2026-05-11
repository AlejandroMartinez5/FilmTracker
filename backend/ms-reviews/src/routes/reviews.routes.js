const express = require("express");
const reviewsController = require("../controllers/reviews.controller");
const {
  authenticateToken,
  optionalAuthenticateToken,
  requireVerifiedEmail
} = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  requireVerifiedEmail,
  reviewsController.createReview
);

router.get(
  "/show/:tvmazeId",
  optionalAuthenticateToken,
  reviewsController.getReviewsByShow
);

router.get("/user/:authId/summary", reviewsController.getUserReviewsSummary);
router.get("/user/:authId", reviewsController.getReviewsByUser);

router.get("/:reviewId/likes", reviewsController.getReviewLikes);

router.put("/:reviewId", authenticateToken, reviewsController.updateReview);

router.post(
  "/:reviewId/image",
  authenticateToken,
  uploadImage,
  reviewsController.uploadReviewImage
);

router.delete("/:reviewId", authenticateToken, reviewsController.deleteReview);

router.post("/:reviewId/like", authenticateToken, reviewsController.likeReview);

router.delete(
  "/:reviewId/like",
  authenticateToken,
  reviewsController.unlikeReview
);

module.exports = router;
