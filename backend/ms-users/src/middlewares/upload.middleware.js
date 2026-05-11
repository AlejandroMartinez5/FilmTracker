const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_IMAGE_UPLOAD_BYTES) || 5 * 1024 * 1024
  }
});

const uploadImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "La imagen supera el tamano maximo permitido"
      });
    }

    return res.status(400).json({
      message: error.message || "Error al procesar la imagen"
    });
  });
};

module.exports = {
  upload,
  uploadImage
};
