const favoritesRepository = require("../repositories/favorites.repository");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const addFavorite = async (authId, tvmazeId) => {
  const existingFavorite = await favoritesRepository.findFavorite(authId, tvmazeId);

  if (existingFavorite) {
    const error = new Error("Este show ya está en favoritos");
    error.statusCode = 409;
    throw error;
  }

  return favoritesRepository.createFavorite(authId, tvmazeId);
};

const getFavorites = async (authId, paginationQuery) => {
  const paginationParams = getPaginationParams(paginationQuery);
  const total = await favoritesRepository.countFavoritesByAuthId(authId);
  const data = await favoritesRepository.getFavoritesByAuthId(
    authId,
    paginationParams
  );

  return {
    data,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
};

const removeFavorite = async (authId, tvmazeId) => {
  const deletedFavorite = await favoritesRepository.deleteFavorite(authId, tvmazeId);

  if (!deletedFavorite) {
    const error = new Error("Favorito no encontrado");
    error.statusCode = 404;
    throw error;
  }

  return deletedFavorite;
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite
};
