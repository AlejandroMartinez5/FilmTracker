const { publicBaseUrl } = require("../config/env");
const {
  CONTENT_TYPE_BY_EXTENSION,
  MEDIA_TYPES
} = require("../constants/media.constants");

const buildMediaResponse = ({
  mediaType,
  storageId,
  extension,
  stats,
  authId = "",
  reviewId = 0,
  commentId = 0
}) => {
  return {
    media_id: `${mediaType.key}:${storageId}`,
    owner_auth_id: authId,
    review_id: Number(reviewId),
    comment_id: Number(commentId),
    url: `${publicBaseUrl}/${mediaType.directory}/${storageId}${extension}`,
    content_type: CONTENT_TYPE_BY_EXTENSION[extension],
    size_bytes: stats.size,
    created_at: stats.mtime.toISOString()
  };
};

const buildProfileResponse = ({ authId, storageId, extension, stats }) => {
  return buildMediaResponse({
    mediaType: MEDIA_TYPES.PROFILE,
    storageId,
    authId,
    extension,
    stats
  });
};

const buildReviewResponse = ({
  reviewId,
  authId = "",
  storageId,
  extension,
  stats
}) => {
  return buildMediaResponse({
    mediaType: MEDIA_TYPES.REVIEW,
    storageId,
    authId,
    reviewId,
    extension,
    stats
  });
};

const buildCommentResponse = ({
  commentId,
  reviewId = 0,
  authId = "",
  storageId,
  extension,
  stats
}) => {
  return buildMediaResponse({
    mediaType: MEDIA_TYPES.COMMENT,
    storageId,
    authId,
    reviewId,
    commentId,
    extension,
    stats
  });
};

module.exports = {
  buildProfileResponse,
  buildReviewResponse,
  buildCommentResponse
};
