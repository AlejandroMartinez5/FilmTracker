const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const favoritesRoutes = require("./routes/favorites.routes");
const watchlistRoutes = require("./routes/watchlist.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "ms-users-library funcionando 🚀"
  });
});

app.use("/api/favorites", favoritesRoutes);
app.use("/api/watchlist", watchlistRoutes);

module.exports = app;