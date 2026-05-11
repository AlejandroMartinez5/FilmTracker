const grpc = require("@grpc/grpc-js");
const mediaService = require("../services/media.service");

const statusByCode = {
  INVALID_ARGUMENT: grpc.status.INVALID_ARGUMENT,
  NOT_FOUND: grpc.status.NOT_FOUND
};

const handleUnary = (operation) => async (call, callback) => {
  try {
    const response = await operation(call.request);
    callback(null, response);
  } catch (error) {
    callback({
      code: statusByCode[error.code] || grpc.status.INTERNAL,
      message: error.message || "Error interno en ms-media"
    });
  }
};

module.exports = {
  HealthCheck: (call, callback) => {
    callback(null, {
      message: "ms-media gRPC funcionando"
    });
  },
  UploadProfilePhoto: handleUnary(mediaService.uploadProfilePhoto),
  UploadReviewImage: handleUnary(mediaService.uploadReviewImage),
  UploadCommentImage: handleUnary(mediaService.uploadCommentImage),
  GetProfilePhoto: handleUnary((request) =>
    mediaService.getProfilePhoto(request.auth_id)
  ),
  GetReviewImage: handleUnary((request) =>
    mediaService.getReviewImage(request.review_id)
  ),
  GetCommentImage: handleUnary((request) =>
    mediaService.getCommentImage(request.comment_id)
  ),
  DeleteProfilePhoto: handleUnary((request) =>
    mediaService.deleteProfilePhoto(request.auth_id)
  ),
  DeleteReviewImage: handleUnary((request) =>
    mediaService.deleteReviewImage(request.review_id)
  ),
  DeleteCommentImage: handleUnary((request) =>
    mediaService.deleteCommentImage(request.comment_id)
  )
};
