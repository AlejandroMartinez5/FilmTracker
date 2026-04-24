const watchlistService = require("../services/watchlist.service");

const add = async (req, res) => {
  try {
    const { tvmazeId } = req.body;
    const { authId } = req.user;

    const data = await watchlistService.addToWatchlist(authId, Number(tvmazeId));

    res.status(201).json({
      message: "Agregado a watchlist",
      data
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const getByUser = async (req, res) => {
  try {
    const { authId } = req.user;

    const data = await watchlistService.getWatchlist(authId);

    res.json({
      message: "Watchlist obtenida correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const { tvmazeId } = req.params;
    const { authId } = req.user;

    const data = await watchlistService.removeFromWatchlist(authId, Number(tvmazeId));

    res.json({
      message: "Eliminado de watchlist",
      data
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};

const check = async (req, res) => {
  try {
    const { tvmazeId } = req.params;
    const { authId } = req.user;

    const exists = await watchlistService.checkWatchlist(authId, Number(tvmazeId));

    res.json({ exists });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  add,
  getByUser,
  remove,
  check
};