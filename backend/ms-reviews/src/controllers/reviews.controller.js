const reviewsService = require("../services/reviews.service");

const createReview = async (req, res) => {
  try {
    const review = await reviewsService.createReview(
      req.body,
      req.user,
      req.file
    );

    return res.status(201).json({
      message: "Reseña creada correctamente",
      review
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al crear la reseña"
    });
  }
};

const getReviewsByShow = async (req, res) => {
  try {
    const { tvmazeId } = req.params;

    const result = await reviewsService.getReviewsByShow(
      tvmazeId,
      req.query,
      req.user
    );

    return res.status(200).json({
      reviews: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las reseñas"
    });
  }
};

const getReviewsByUser = async (req, res) => {
  try {
    const { authId } = req.params;

    const result = await reviewsService.getReviewsByUser(authId, req.query);

    return res.status(200).json({
      reviews: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener las reseñas del usuario"
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewsService.getReviewById(reviewId);

    return res.status(200).json({
      review
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener la resena"
    });
  }
};

const getUserReviewsSummary = async (req, res) => {
  try {
    const { authId } = req.params;

    const summary = await reviewsService.getUserReviewsSummary(authId);

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el resumen de reseÃ±as"
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewsService.updateReview(
      reviewId,
      req.body,
      req.user
    );

    return res.status(200).json({
      message: "Reseña actualizada correctamente",
      review
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al actualizar la reseña"
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await reviewsService.deleteReview(reviewId, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al eliminar la reseña"
    });
  }
};

const uploadReviewImage = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewsService.uploadReviewImage(
      reviewId,
      req.file,
      req.user
    );

    return res.status(200).json({
      message: "Imagen de resena subida correctamente",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al subir la imagen de la resena"
    });
  }
};

const removeReviewImage = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewsService.removeReviewImage(reviewId, req.user);

    return res.status(200).json({
      message: "Imagen de resena removida correctamente",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al remover la imagen de la resena"
    });
  }
};

const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await reviewsService.likeReview(reviewId, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al dar like a la reseña"
    });
  }
};

const unlikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await reviewsService.unlikeReview(reviewId, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al quitar like de la reseña"
    });
  }
};

const getReviewLikes = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const result = await reviewsService.getReviewLikes(reviewId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener likes de la reseña"
    });
  }
};

module.exports = {
  createReview,
  getReviewsByShow,
  getReviewsByUser,
  getReviewById,
  getUserReviewsSummary,
  updateReview,
  deleteReview,
  uploadReviewImage,
  removeReviewImage,
  likeReview,
  unlikeReview,
  getReviewLikes
};
