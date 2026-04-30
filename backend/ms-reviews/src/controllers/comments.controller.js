const commentsService = require("../services/comments.service");

const createComment = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const comment = await commentsService.createComment(
      reviewId,
      req.body,
      req.user
    );

    return res.status(201).json({
      message: "Comentario creado correctamente",
      comment
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear comentario"
    });
  }
};

const getCommentsByReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await commentsService.getCommentsByReview(
      reviewId,
      req.query
    );

    return res.status(200).json({
      comments: result.comments,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await commentsService.updateComment(
      commentId,
      req.body,
      req.user
    );

    return res.status(200).json({
      message: "Comentario actualizado",
      comment
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await commentsService.deleteComment(
      commentId,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await commentsService.likeComment(
      commentId,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

const unlikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await commentsService.unlikeComment(
      commentId,
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;

    const result = await commentsService.getCommentLikes(commentId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message
    });
  }
};

module.exports = {
  createComment,
  getCommentsByReview,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentLikes
};
