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

const uploadProfilePhoto = ({ authId, file }) => {
  return new Promise((resolve, reject) => {
    client.UploadProfilePhoto(
      {
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

const deleteProfilePhoto = (authId) => {
  return new Promise((resolve, reject) => {
    client.DeleteProfilePhoto(
      {
        auth_id: authId
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
  uploadProfilePhoto,
  deleteProfilePhoto
};
