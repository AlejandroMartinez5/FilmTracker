const leaderboardsService = require("../services/leaderboards.service");

const getTopUsers = async (req, res) => {
  try {
    const result = await leaderboardsService.getTopUsers(req.query, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el ranking de usuarios"
    });
  }
};

const getTopReviews = async (req, res) => {
  try {
    const result = await leaderboardsService.getTopReviews(req.query, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el ranking de reseñas"
    });
  }
};

const getTopComments = async (req, res) => {
  try {
    const result = await leaderboardsService.getTopComments(req.query, req.user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al obtener el ranking de comentarios"
    });
  }
};

module.exports = {
  getTopUsers,
  getTopReviews,
  getTopComments
};
