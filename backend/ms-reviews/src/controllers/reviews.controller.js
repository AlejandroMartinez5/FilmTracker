const reviewsService = require("../services/reviews.service");

const createReview = async (req, res) => {
  try {
    const review = await reviewsService.createReview(req.body, req.user);

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

    const result = await reviewsService.getReviewsByShow(tvmazeId, req.query);

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
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  getReviewLikes
};
