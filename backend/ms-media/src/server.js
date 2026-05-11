require("dotenv").config();

const { grpcHost, grpcPort, httpPort, maxFileSizeBytes } = require("./config/env");
const { grpc, proto } = require("./config/grpc");
const app = require("./app");
const handlers = require("./grpc/media.handlers");
const { ensureUploadDirs } = require("./services/media.service");

const startGrpcServer = () => {
  const server = new grpc.Server({
    "grpc.max_receive_message_length": maxFileSizeBytes + 64 * 1024,
    "grpc.max_send_message_length": maxFileSizeBytes + 64 * 1024
  });
  server.addService(proto.MediaService.service, handlers);

  const address = `${grpcHost}:${grpcPort}`;

  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("No se pudo iniciar ms-media gRPC:", error.message);
        process.exit(1);
      }

      console.log(`ms-media gRPC corriendo en ${grpcHost}:${port}`);
    }
  );
};

const startHttpServer = () => {
  app.listen(httpPort, () => {
    console.log(`ms-media HTTP sirviendo archivos en puerto ${httpPort}`);
  });
};

const startServer = async () => {
  await ensureUploadDirs();
  startGrpcServer();
  startHttpServer();
};

startServer();
