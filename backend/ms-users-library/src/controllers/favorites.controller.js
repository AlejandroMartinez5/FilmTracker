const favoritesService = require("../services/favorites.service");

const parseTvmazeId = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const addFavorite = async (req, res) => {
  try {
    const { tvmazeId } = req.body;
    const { authId } = req.user;
    const parsedTvmazeId = parseTvmazeId(tvmazeId);

    if (parsedTvmazeId === null) {
      return res.status(400).json({
        message: "tvmazeId debe ser un entero mayor a 0"
      });
    }

    const favorite = await favoritesService.addFavorite(authId, parsedTvmazeId);

    return res.status(201).json({
      message: "Favorito agregado correctamente",
      data: favorite
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { authId } = req.user;
    const favorites = await favoritesService.getFavorites(authId);

    return res.status(200).json({
      message: "Favoritos obtenidos correctamente",
      data: favorites
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { tvmazeId } = req.params;
    const { authId } = req.user;
    const parsedTvmazeId = parseTvmazeId(tvmazeId);

    if (parsedTvmazeId === null) {
      return res.status(400).json({
        message: "tvmazeId debe ser un entero mayor a 0"
      });
    }

    await favoritesService.removeFavorite(authId, parsedTvmazeId);

    return res.status(200).json({
      message: "Favorito eliminado correctamente"
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite
};
