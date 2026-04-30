const watchlistRepository = require("../repositories/watchlist.repository");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const addToWatchlist = async (authId, tvmazeId) => {
  const exists = await watchlistRepository.exists(authId, tvmazeId);

  if (exists) {
    throw new Error("La serie ya está en tu watchlist");
  }

  return await watchlistRepository.add(authId, tvmazeId);
};

const getWatchlist = async (authId, paginationQuery) => {
  const paginationParams = getPaginationParams(paginationQuery);
  const total = await watchlistRepository.countByUser(authId);
  const data = await watchlistRepository.getByUser(authId, paginationParams);

  return {
    data,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
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
