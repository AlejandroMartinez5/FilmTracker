const { MEDIA_TYPES } = require("../constants/media.constants");
const {
  buildCommentResponse,
  buildProfileResponse,
  buildReviewResponse
} = require("../mappers/media-response.mapper");
const mediaStorage = require("../storage/media.storage");
const { createMediaError } = require("../utils/media-error.util");
const {
  normalizeCommentRequest,
  normalizeProfileRequest,
  normalizeReviewRequest,
  validateImagePayload
} = require("../validators/media.validator");

const notFound = (message) => {
  throw createMediaError(message, "NOT_FOUND");
};

const uploadProfilePhoto = async ({
  auth_id: authId,
  content_type: contentType,
  image
}) => {
  const profile = normalizeProfileRequest({ authId });
  const { buffer, extension } = validateImagePayload({ contentType, image });

  const storedImage = await mediaStorage.saveSingleImage({
    directory: MEDIA_TYPES.PROFILE.directory,
    storageId: profile.storageId,
    extension,
    buffer
  });

  return buildProfileResponse({
    authId: profile.authId,
    storageId: profile.storageId,
    ...storedImage
  });
};

const uploadReviewImage = async ({
  review_id: reviewId,
  auth_id: authId,
  content_type: contentType,
  image
}) => {
  const review = normalizeReviewRequest({ reviewId });
  const { buffer, extension } = validateImagePayload({ contentType, image });

  const storedImage = await mediaStorage.saveSingleImage({
    directory: MEDIA_TYPES.REVIEW.directory,
    storageId: review.storageId,
    extension,
    buffer
  });

  return buildReviewResponse({
    reviewId: review.reviewId,
    authId: authId?.trim() || "",
    storageId: review.storageId,
    ...storedImage
  });
};

const uploadCommentImage = async ({
  comment_id: commentId,
  review_id: reviewId,
  auth_id: authId,
  content_type: contentType,
  image
}) => {
  const comment = normalizeCommentRequest({ commentId, reviewId });
  const { buffer, extension } = validateImagePayload({ contentType, image });

  const storedImage = await mediaStorage.saveSingleImage({
    directory: MEDIA_TYPES.COMMENT.directory,
    storageId: comment.storageId,
    extension,
    buffer
  });

  return buildCommentResponse({
    commentId: comment.commentId,
    reviewId: comment.reviewId,
    authId: authId?.trim() || "",
    storageId: comment.storageId,
    ...storedImage
  });
};

const getProfilePhoto = async (authId) => {
  const profile = normalizeProfileRequest({ authId });
  const existing = await mediaStorage.findImage({
    directory: MEDIA_TYPES.PROFILE.directory,
    storageId: profile.storageId
  });

  if (!existing) {
    notFound("Foto de perfil no encontrada");
  }

  return buildProfileResponse({
    authId: profile.authId,
    storageId: profile.storageId,
    extension: existing.extension,
    stats: existing.stats
  });
};

const getReviewImage = async (reviewId) => {
  const review = normalizeReviewRequest({ reviewId });
  const existing = await mediaStorage.findImage({
    directory: MEDIA_TYPES.REVIEW.directory,
    storageId: review.storageId
  });

  if (!existing) {
    notFound("Imagen de resena no encontrada");
  }

  return buildReviewResponse({
    reviewId: review.reviewId,
    storageId: review.storageId,
    extension: existing.extension,
    stats: existing.stats
  });
};

const getCommentImage = async (commentId) => {
  const comment = normalizeCommentRequest({ commentId });
  const existing = await mediaStorage.findImage({
    directory: MEDIA_TYPES.COMMENT.directory,
    storageId: comment.storageId
  });

  if (!existing) {
    notFound("Imagen de comentario no encontrada");
  }

  return buildCommentResponse({
    commentId: comment.commentId,
    storageId: comment.storageId,
    extension: existing.extension,
    stats: existing.stats
  });
};

const deleteProfilePhoto = async (authId) => {
  const profile = normalizeProfileRequest({ authId });
  const deleted = await mediaStorage.deleteImage({
    directory: MEDIA_TYPES.PROFILE.directory,
    storageId: profile.storageId
  });

  return {
    deleted,
    message: deleted
      ? "Foto de perfil eliminada correctamente"
      : "Foto de perfil no encontrada"
  };
};

const deleteReviewImage = async (reviewId) => {
  const review = normalizeReviewRequest({ reviewId });
  const deleted = await mediaStorage.deleteImage({
    directory: MEDIA_TYPES.REVIEW.directory,
    storageId: review.storageId
  });

  return {
    deleted,
    message: deleted
      ? "Imagen de resena eliminada correctamente"
      : "Imagen de resena no encontrada"
  };
};

const deleteCommentImage = async (commentId) => {
  const comment = normalizeCommentRequest({ commentId });
  const deleted = await mediaStorage.deleteImage({
    directory: MEDIA_TYPES.COMMENT.directory,
    storageId: comment.storageId
  });

  return {
    deleted,
    message: deleted
      ? "Imagen de comentario eliminada correctamente"
      : "Imagen de comentario no encontrada"
  };
};

module.exports = {
  ensureUploadDirs: mediaStorage.ensureUploadDirs,
  uploadProfilePhoto,
  uploadReviewImage,
  uploadCommentImage,
  getProfilePhoto,
  getReviewImage,
  getCommentImage,
  deleteProfilePhoto,
  deleteReviewImage,
  deleteCommentImage
};
