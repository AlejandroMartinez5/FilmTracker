const favoritesRepository = require("../repositories/favorites.repository");
const { publishFavoriteAdded } = require("../utils/notification-events.util");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const validateAuthId = (authId) => {
  const normalizedAuthId = authId?.trim();

  if (!normalizedAuthId) {
    const error = new Error("authId es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  return normalizedAuthId;
};

const addFavorite = async (authId, tvmazeId) => {
  const existingFavorite = await favoritesRepository.findFavorite(authId, tvmazeId);

  if (existingFavorite) {
    const error = new Error("Este show ya está en favoritos");
    error.statusCode = 409;
    throw error;
  }

  const favorite = await favoritesRepository.createFavorite(authId, tvmazeId);

  await publishFavoriteAdded({
    authId,
    tvmazeId
  });

  return favorite;
};

const getFavorites = async (authId, paginationQuery) => {
  const normalizedAuthId = validateAuthId(authId);
  const paginationParams = getPaginationParams(paginationQuery);
  const total = await favoritesRepository.countFavoritesByAuthId(normalizedAuthId);
  const data = await favoritesRepository.getFavoritesByAuthId(
    normalizedAuthId,
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
