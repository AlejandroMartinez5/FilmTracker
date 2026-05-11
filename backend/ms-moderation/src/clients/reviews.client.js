const REVIEWS_SERVICE_URL =
  process.env.REVIEWS_SERVICE_URL || "http://reviews-service:3005/api";

const requestReviewsService = async ({ path, method, token }) => {
  const response = await fetch(`${REVIEWS_SERVICE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Error en ms-reviews");
    error.status = response.status;
    throw error;
  }

  return data.data || data;
};

const getReview = async ({ reviewId, token }) => {
  const data = await requestReviewsService({
    path: `/reviews/${reviewId}`,
    method: "GET",
    token
  });

  return data.review || data;
};

const getComment = async ({ commentId, token }) => {
  const data = await requestReviewsService({
    path: `/comments/${commentId}`,
    method: "GET",
    token
  });

  return data.comment || data;
};

const deleteReview = async ({ reviewId, token }) => {
  return requestReviewsService({
    path: `/reviews/${reviewId}`,
    method: "DELETE",
    token
  });
};

const deleteComment = async ({ commentId, token }) => {
  return requestReviewsService({
    path: `/comments/${commentId}`,
    method: "DELETE",
    token
  });
};

const removeReviewImage = async ({ reviewId, token }) => {
  return requestReviewsService({
    path: `/reviews/${reviewId}/image`,
    method: "DELETE",
    token
  });
};

const removeCommentImage = async ({ commentId, token }) => {
  return requestReviewsService({
    path: `/comments/${commentId}/image`,
    method: "DELETE",
    token
  });
};

module.exports = {
  getReview,
  getComment,
  deleteReview,
  deleteComment,
  removeReviewImage,
  removeCommentImage
};
