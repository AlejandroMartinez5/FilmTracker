const watchlistRepository = require("../repositories/watchlist.repository");

const addToWatchlist = async (authId, tvmazeId) => {
  const exists = await watchlistRepository.exists(authId, tvmazeId);

  if (exists) {
    throw new Error("La serie ya está en tu watchlist");
  }

  return await watchlistRepository.add(authId, tvmazeId);
};

const getWatchlist = async (authId) => {
  return await watchlistRepository.getByUser(authId);
};

const removeFromWatchlist = async (authId, tvmazeId) => {
  const item = await watchlistRepository.remove(authId, tvmazeId);

  if (!item) {
    throw new Error("La serie no está en tu watchlist");
  }

  return item;
};

const checkWatchlist = async (authId, tvmazeId) => {
  return await watchlistRepository.exists(authId, tvmazeId);
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  checkWatchlist
};