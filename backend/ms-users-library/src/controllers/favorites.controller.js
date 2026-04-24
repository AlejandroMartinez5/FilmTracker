const favoritesService = require("../services/favorites.service");

const addFavorite = async (req, res) => {
  try {
    const { tvmazeId } = req.body;
    const { authId } = req.user;

    if (!tvmazeId) {
      return res.status(400).json({
        message: "tvmazeId es obligatorio"
      });
    }

    const favorite = await favoritesService.addFavorite(authId, Number(tvmazeId));

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

    await favoritesService.removeFavorite(authId, Number(tvmazeId));

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