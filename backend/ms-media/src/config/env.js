const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const grpcHost = process.env.GRPC_HOST || "0.0.0.0";
const grpcPort = Number(process.env.GRPC_PORT) || 50051;
const httpPort = Number(process.env.HTTP_PORT) || 3010;
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const publicBaseUrl =
  process.env.PUBLIC_BASE_URL || `http://localhost:${httpPort}/media`;
const maxFileSizeBytes = Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024;

module.exports = {
  grpcHost,
  grpcPort,
  httpPort,
  uploadDir,
  publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
  maxFileSizeBytes
};
