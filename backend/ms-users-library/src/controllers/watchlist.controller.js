const watchlistService = require("../services/watchlist.service");

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

const add = async (req, res) => {
  try {
    const { tvmazeId } = req.body;
    const { authId } = req.user;
    const parsedTvmazeId = parseTvmazeId(tvmazeId);

    if (parsedTvmazeId === null) {
      return res.status(400).json({
        message: "tvmazeId debe ser un entero mayor a 0"
      });
    }

    const data = await watchlistService.addToWatchlist(authId, parsedTvmazeId);

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

    const result = await watchlistService.getWatchlist(authId, req.query);

    res.json({
      message: "Watchlist obtenida correctamente",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};

const remove = async (req, res) => {
  try {
    const { tvmazeId } = req.params;
    const { authId } = req.user;
    const parsedTvmazeId = parseTvmazeId(tvmazeId);

    if (parsedTvmazeId === null) {
      return res.status(400).json({
        message: "tvmazeId debe ser un entero mayor a 0"
      });
    }

    const data = await watchlistService.removeFromWatchlist(authId, parsedTvmazeId);

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
    const parsedTvmazeId = parseTvmazeId(tvmazeId);

    if (parsedTvmazeId === null) {
      return res.status(400).json({
        message: "tvmazeId debe ser un entero mayor a 0"
      });
    }

    const exists = await watchlistService.checkWatchlist(authId, parsedTvmazeId);

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
