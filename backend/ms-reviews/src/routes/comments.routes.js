const express = require("express");
const commentsController = require("../controllers/comments.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/reviews/:reviewId/comments",
  authenticateToken,
  commentsController.createComment
);

router.get(
  "/reviews/:reviewId/comments",
  commentsController.getCommentsByReview
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