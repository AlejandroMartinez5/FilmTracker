const commentsRepository = require("../repositories/comments.repository");
const reviewsRepository = require("../repositories/reviews.repository");
const mediaClient = require("../clients/media.client");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const COMMENT_EDIT_LIMIT_MINUTES =
  Number(process.env.COMMENT_EDIT_LIMIT_MINUTES) || 30;

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

const canEditComment = (comment, user) => {
  const isOwner = comment.auth_id === user.authId;

  if (!isOwner) {
    return false;
  }

  const createdAt = new Date(comment.created_at);
  const now = new Date();
  const diffMinutes = (now - createdAt) / (1000 * 60);

  return diffMinutes <= COMMENT_EDIT_LIMIT_MINUTES;
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

const getCommentsByReview = async (reviewId, paginationQuery, user = null) => {
  validateId(reviewId, "El reviewId debe ser válido");

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  const paginationParams = getPaginationParams(paginationQuery);
  const total = await commentsRepository.countByReviewId(Number(reviewId));
  const comments = await commentsRepository.findByReviewId(
    Number(reviewId),
    paginationParams,
    user?.authId || null
  );

  return {
    comments,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
};

const getCommentById = async (commentId) => {
  validateId(commentId, "El commentId debe ser valido");

  const comment = await commentsRepository.findById(Number(commentId));

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  return comment;
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

  if (!canEditComment(comment, user)) {
    const error = new Error(
      `Solo puedes editar tu comentario durante los primeros ${COMMENT_EDIT_LIMIT_MINUTES} minutos`
    );
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

  await Promise.allSettled([
    mediaClient.deleteCommentImage(Number(commentId))
  ]);

  return {
    message: "Comentario eliminado correctamente"
  };
};

const uploadCommentImage = async (commentId, file, user) => {
  validateId(commentId, "El commentId debe ser valido");

  if (!file) {
    const error = new Error("La imagen del comentario es obligatoria");
    error.status = 400;
    throw error;
  }

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  if (!canEditComment(comment, user)) {
    const error = new Error(
      `Solo puedes subir imagen a tu comentario durante los primeros ${COMMENT_EDIT_LIMIT_MINUTES} minutos`
    );
    error.status = 403;
    throw error;
  }

  try {
    const media = await mediaClient.uploadCommentImage({
      commentId: Number(commentId),
      reviewId: Number(comment.review_id),
      authId: user.authId,
      file
    });
    const updatedComment = await commentsRepository.updateCommentImage({
      commentId: Number(commentId),
      imageUrl: media.url
    });

    return {
      commentId: Number(commentId),
      reviewId: Number(comment.review_id),
      imageUrl: media.url,
      comment: updatedComment,
      media
    };
  } catch (error) {
    const customError = new Error(error.details || error.message);
    customError.status = error.code === 3 ? 400 : 502;
    throw customError;
  }
};

const removeCommentImage = async (commentId, user) => {
  validateId(commentId, "El commentId debe ser valido");

  const comment = await commentsRepository.findById(commentId);

  if (!comment) {
    const error = new Error("Comentario no encontrado");
    error.status = 404;
    throw error;
  }

  const isOwner = comment.auth_id === user.authId;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    const error = new Error("No tienes permisos para quitar esta imagen");
    error.status = 403;
    throw error;
  }

  const updatedComment = await commentsRepository.updateCommentImage({
    commentId: Number(commentId),
    imageUrl: null
  });

  await Promise.allSettled([
    mediaClient.deleteCommentImage(Number(commentId))
  ]);

  return {
    commentId: Number(commentId),
    reviewId: Number(comment.review_id),
    imageUrl: null,
    comment: updatedComment
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
  getCommentById,
  updateComment,
  deleteComment,
  uploadCommentImage,
  removeCommentImage,
  likeComment,
  unlikeComment,
  getCommentLikes
};
