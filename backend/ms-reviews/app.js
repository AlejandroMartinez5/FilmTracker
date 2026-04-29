const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const reviewsRoutes = require("./routes/reviews.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "ms-reviews funcionando 🚀"
  });
});

app.use("/api/reviews", reviewsRoutes);

module.exports = app;