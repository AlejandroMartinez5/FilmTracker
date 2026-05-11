const { maxFileSizeBytes } = require("../config/env");
const { ALLOWED_CONTENT_TYPES } = require("../constants/media.constants");
const { createMediaError } = require("../utils/media-error.util");
const { sanitizeId } = require("../utils/id.util");

const getBuffer = (image) => {
  if (Buffer.isBuffer(image)) {
    return image;
  }

  return Buffer.from(image || []);
};

const validateImagePayload = ({ contentType, image }) => {
  const extension = ALLOWED_CONTENT_TYPES[contentType];

  if (!extension) {
    throw createMediaError("Solo se permiten imagenes JPEG, PNG o WEBP");
  }

  const buffer = getBuffer(image);

  if (!buffer.length) {
    throw createMediaError("La imagen es obligatoria");
  }

  if (buffer.length > maxFileSizeBytes) {
    throw createMediaError("La imagen supera el tamano maximo permitido");
  }

  return {
    buffer,
    extension
  };
};

const normalizeRequiredString = (value, message) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw createMediaError(message);
  }

  return normalizedValue;
};

const normalizePositiveInteger = (value, message) => {
  const normalizedValue = Number(value);

  if (!Number.isInteger(normalizedValue) || normalizedValue <= 0) {
    throw createMediaError(message);
  }

  return normalizedValue;
};

const normalizeProfileRequest = ({ authId }) => {
  const normalizedAuthId = normalizeRequiredString(authId, "auth_id es obligatorio");

  return {
    authId: normalizedAuthId,
    storageId: sanitizeId(normalizedAuthId)
  };
};

const normalizeReviewRequest = ({ reviewId }) => {
  const normalizedReviewId = normalizePositiveInteger(
    reviewId,
    "review_id debe ser un entero mayor a 0"
  );

  return {
    reviewId: normalizedReviewId,
    storageId: String(normalizedReviewId)
  };
};

const normalizeCommentRequest = ({ commentId, reviewId = null }) => {
  const normalizedCommentId = normalizePositiveInteger(
    commentId,
    "comment_id debe ser un entero mayor a 0"
  );

  const normalizedReviewId =
    reviewId === null || reviewId === undefined
      ? 0
      : normalizePositiveInteger(reviewId, "review_id debe ser un entero mayor a 0");

  return {
    commentId: normalizedCommentId,
    reviewId: normalizedReviewId,
    storageId: String(normalizedCommentId)
  };
};

module.exports = {
  validateImagePayload,
  normalizeProfileRequest,
  normalizeReviewRequest,
  normalizeCommentRequest
};
