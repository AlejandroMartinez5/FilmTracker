const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const getPaginationParams = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
};

const buildPaginationMeta = ({ page, limit, total }) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationMeta
};
