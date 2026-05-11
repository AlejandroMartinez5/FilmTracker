const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const protoPath = path.join(__dirname, "../../proto/media.proto");
const mediaGrpcUrl = process.env.MEDIA_GRPC_URL || "localhost:50051";

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).reeltrack.media;

const client = new proto.MediaService(
  mediaGrpcUrl,
  grpc.credentials.createInsecure()
);

const uploadReviewImage = ({ reviewId, authId, file }) => {
  return new Promise((resolve, reject) => {
    client.UploadReviewImage(
      {
        review_id: reviewId,
        auth_id: authId,
        file_name: file.originalname,
        content_type: file.mimetype,
        image: file.buffer
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

const uploadCommentImage = ({ commentId, reviewId, authId, file }) => {
  return new Promise((resolve, reject) => {
    client.UploadCommentImage(
      {
        comment_id: commentId,
        review_id: reviewId,
        auth_id: authId,
        file_name: file.originalname,
        content_type: file.mimetype,
        image: file.buffer
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

const deleteReviewImage = (reviewId) => {
  return new Promise((resolve, reject) => {
    client.DeleteReviewImage(
      {
        review_id: reviewId
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

const deleteCommentImage = (commentId) => {
  return new Promise((resolve, reject) => {
    client.DeleteCommentImage(
      {
        comment_id: commentId
      },
      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      }
    );
  });
};

module.exports = {
  uploadReviewImage,
  uploadCommentImage,
  deleteReviewImage,
  deleteCommentImage
};
