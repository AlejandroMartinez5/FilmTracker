const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { uploadDir } = require("./config/env");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "ms-media HTTP funcionando"
  });
});

app.use("/media", express.static(uploadDir));

module.exports = app;
