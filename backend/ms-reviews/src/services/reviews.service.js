const reviewsRepository = require("../repositories/reviews.repository");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const REVIEW_EDIT_LIMIT_MINUTES =
  Number(process.env.REVIEW_EDIT_LIMIT_MINUTES) || 30;

const validateReviewData = ({ tvmazeId, rating, content }) => {
  if (!tvmazeId || isNaN(tvmazeId) || Number(tvmazeId) <= 0) {
    const error = new Error("El tvmazeId es obligatorio y debe ser mayor a 0");
    error.status = 400;
    throw error;
  }

  if (!rating || isNaN(rating) || Number(rating) < 1 || Number(rating) > 5) {
    const error = new Error("El rating debe estar entre 1 y 5");
    error.status = 400;
    throw error;
  }

  if (!content || !content.trim()) {
    const error = new Error("El contenido de la reseña es obligatorio");
    error.status = 400;
    throw error;
  }
};

const canEditReview = (review, user) => {
  const isOwner = review.auth_id === user.authId;

  if (!isOwner) {
    return false;
  }

  const createdAt = new Date(review.created_at);
  const now = new Date();

  const diffMs = now - createdAt;
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= REVIEW_EDIT_LIMIT_MINUTES;
};

const createReview = async ({ tvmazeId, rating, title, content }, user) => {
  validateReviewData({ tvmazeId, rating, content });

  try {
    const review = await reviewsRepository.createReview({
      authId: user.authId,
      tvmazeId: Number(tvmazeId),
      rating: Number(rating),
      title: title?.trim() || null,
      content: content.trim()
    });

    return review;
  } catch (error) {
    if (error.code === "23505") {
      const customError = new Error("Ya tienes una reseña para esta serie");
      customError.status = 409;
      throw customError;
    }

    throw error;
  }
};

const getReviewsByShow = async (tvmazeId, paginationQuery) => {
  if (!tvmazeId || isNaN(tvmazeId) || Number(tvmazeId) <= 0) {
    const error = new Error("El tvmazeId debe ser válido");
    error.status = 400;
    throw error;
  }

  const paginationParams = getPaginationParams(paginationQuery);
  const total = await reviewsRepository.countByShowId(Number(tvmazeId));
  const reviews = await reviewsRepository.findByShowId(
    Number(tvmazeId),
    paginationParams
  );

  return {
    reviews,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
};

const getReviewsByUser = async (authId, paginationQuery) => {
  if (!authId) {
    const error = new Error("El authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const paginationParams = getPaginationParams(paginationQuery);
  const total = await reviewsRepository.countByUser(authId);
  const reviews = await reviewsRepository.findByUser(authId, paginationParams);

  return {
    reviews,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
};

const updateReview = async (reviewId, { rating, title, content }, user) => {
  if (!reviewId || isNaN(reviewId)) {
    const error = new Error("El reviewId debe ser válido");
    error.status = 400;
    throw error;
  }

  validateReviewData({
    tvmazeId: 1,
    rating,
    content
  });

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  if (!canEditReview(review, user)) {
    const error = new Error(
      `Solo puedes editar tu reseña durante los primeros ${REVIEW_EDIT_LIMIT_MINUTES} minutos`
    );
    error.status = 403;
    throw error;
  }

  return await reviewsRepository.updateReview({
    reviewId,
    rating: Number(rating),
    title: title?.trim() || null,
    content: content.trim()
  });
};

const deleteReview = async (reviewId, user) => {
  if (!reviewId || isNaN(reviewId)) {
    const error = new Error("El reviewId debe ser válido");
    error.status = 400;
    throw error;
  }

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  const isOwner = review.auth_id === user.authId;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    const error = new Error("No tienes permisos para eliminar esta reseña");
    error.status = 403;
    throw error;
  }

  await reviewsRepository.deleteReview(reviewId);

  return {
    message: "Reseña eliminada correctamente"
  };
};

const likeReview = async (reviewId, user) => {
  if (!reviewId || isNaN(reviewId)) {
    const error = new Error("El reviewId debe ser válido");
    error.status = 400;
    throw error;
  }

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  const like = await reviewsRepository.likeReview({
    reviewId,
    authId: user.authId
  });

  if (!like) {
    return {
      message: "Ya habías dado like a esta reseña"
    };
  }

  return {
    message: "Like agregado correctamente"
  };
};

const unlikeReview = async (reviewId, user) => {
  if (!reviewId || isNaN(reviewId)) {
    const error = new Error("El reviewId debe ser válido");
    error.status = 400;
    throw error;
  }

  const removedLike = await reviewsRepository.unlikeReview({
    reviewId,
    authId: user.authId
  });

  if (!removedLike) {
    const error = new Error("No habías dado like a esta reseña");
    error.status = 404;
    throw error;
  }

  return {
    message: "Like eliminado correctamente"
  };
};

const getReviewLikes = async (reviewId) => {
  if (!reviewId || isNaN(reviewId)) {
    const error = new Error("El reviewId debe ser válido");
    error.status = 400;
    throw error;
  }

  const review = await reviewsRepository.findById(reviewId);

  if (!review) {
    const error = new Error("Reseña no encontrada");
    error.status = 404;
    throw error;
  }

  const likesCount = await reviewsRepository.countLikes(reviewId);

  return {
    reviewId: Number(reviewId),
    likesCount
  };
};

module.exports = {
  createReview,
  getReviewsByShow,
  getReviewsByUser,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  getReviewLikes
};
