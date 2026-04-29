const commentsRepository = require("../repositories/comments.repository");
const reviewsRepository = require("../repositories/reviews.repository");

const validateCommentContent = (content) => {
  if (!content || !content.trim()) {
    const error = new Error("El contenido del comentario es obligatorio");
    error.status = 400;
    throw error;
  }
};

const validateId = (id, message) => {
  if (!id || isNaN(id) || Number(id) <= 0) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
};

const createComment = async (reviewId, { content }, user) => {
  validateId(reviewId, "El reviewId debe ser válido");
  validateCommentContent(content);

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  const comment = await commentsRepository.createComment({
    reviewId: Number(reviewId),
    authId: user.authId,
    content: content.trim()
  });

  return comment;
};

const getCommentsByReview = async (reviewId) => {
  validateId(reviewId, "El reviewId debe ser válido");

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  return await commentsRepository.findByReviewId(Number(reviewId));
};

const updateComment = async (commentId, { content }, user) => {
  validateId(commentId, "El commentId debe ser válido");
  validateCommentContent(content);

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  const isOwner = comment.auth_id === user.authId;

  if (!isOwner) {
    const error = new Error("No tienes permisos para editar este comentario");
    error.status = 403;
    throw error;
  }

  return await commentsRepository.updateComment({
    commentId: Number(commentId),
    content: content.trim()
  });
};

const deleteComment = async (commentId, user) => {
  validateId(commentId, "El commentId debe ser válido");

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  const isOwner = comment.auth_id === user.authId;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    const error = new Error("No tienes permisos para eliminar este comentario");
    error.status = 403;
    throw error;
  }

  await commentsRepository.deleteComment(Number(commentId));

  return {
    message: "Comentario eliminado correctamente"
  };
};

const likeComment = async (commentId, user) => {
  validateId(commentId, "El commentId debe ser válido");

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  const like = await commentsRepository.likeComment({
    commentId: Number(commentId),
    authId: user.authId
  });

  if (!like) {
    return {
      message: "Ya habías dado like a este comentario"
    };
  }

  return {
    message: "Like agregado correctamente"
  };
};

const unlikeComment = async (commentId, user) => {
  validateId(commentId, "El commentId debe ser válido");

  const removedLike = await commentsRepository.unlikeComment({
    commentId: Number(commentId),
    authId: user.authId
  });

  if (!removedLike) {
    const error = new Error("No habías dado like a este comentario");
    error.status = 404;
    throw error;
  }

  return {
    message: "Like eliminado correctamente"
  };
};

const getCommentLikes = async (commentId) => {
  validateId(commentId, "El commentId debe ser válido");

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  const likesCount = await commentsRepository.countLikes(Number(commentId));

  return {
    commentId: Number(commentId),
    likesCount
  };
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