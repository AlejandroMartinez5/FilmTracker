const { pool } = require("../config/db");

const createFavorite = async (authId, tvmazeId) => {
  const query = `
    INSERT INTO favorites (auth_id, tvmaze_id)
    VALUES ($1, $2)
    RETURNING id, auth_id, tvmaze_id, created_at
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rows[0];
};

const findFavorite = async (authId, tvmazeId) => {
  const query = `
    SELECT id, auth_id, tvmaze_id, created_at
    FROM favorites
    WHERE auth_id = $1 AND tvmaze_id = $2
    LIMIT 1
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rows[0] || null;
};

const getFavoritesByAuthId = async (authId, { limit, offset }) => {
  const query = `
    SELECT id, auth_id, tvmaze_id, created_at
    FROM favorites
    WHERE auth_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [authId, limit, offset]);
  return result.rows;
};

const countFavoritesByAuthId = async (authId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM favorites
    WHERE auth_id = $1
  `;
  const result = await pool.query(query, [authId]);
  return Number(result.rows[0].total);
};

const deleteFavorite = async (authId, tvmazeId) => {
  const query = `
    DELETE FROM favorites
    WHERE auth_id = $1 AND tvmaze_id = $2
    RETURNING id, auth_id, tvmaze_id, created_at
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rows[0] || null;
};

module.exports = {
  createFavorite,
  findFavorite,
  getFavoritesByAuthId,
  countFavoritesByAuthId,
  deleteFavorite
};
