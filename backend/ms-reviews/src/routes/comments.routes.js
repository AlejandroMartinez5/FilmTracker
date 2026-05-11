const express = require("express");
const commentsController = require("../controllers/comments.controller");
const {
  authenticateToken,
  optionalAuthenticateToken,
  requireVerifiedEmail
} = require("../middlewares/auth.middleware");
const { uploadImage } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post(
  "/reviews/:reviewId/comments",
  authenticateToken,
  requireVerifiedEmail,
  commentsController.createComment
);

router.get(
  "/reviews/:reviewId/comments",
  optionalAuthenticateToken,
  commentsController.getCommentsByReview
);

router.get(
  "/comments/:commentId",
  commentsController.getCommentById
);

router.put(
  "/comments/:commentId",
  authenticateToken,
  commentsController.updateComment
);

router.delete(
  "/comments/:commentId",
  authenticateToken,
  commentsController.deleteComment
);

router.post(
  "/comments/:commentId/image",
  authenticateToken,
  uploadImage,
  commentsController.uploadCommentImage
);

router.delete(
  "/comments/:commentId/image",
  authenticateToken,
  commentsController.removeCommentImage
);

router.post(
  "/comments/:commentId/like",
  authenticateToken,
  commentsController.likeComment
);

router.delete(
  "/comments/:commentId/like",
  authenticateToken,
  commentsController.unlikeComment
);

router.get(
  "/comments/:commentId/likes",
  commentsController.getCommentLikes
);

module.exports = router;
