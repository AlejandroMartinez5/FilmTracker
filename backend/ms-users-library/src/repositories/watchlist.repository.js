const { pool } = require("../config/db");

const add = async (authId, tvmazeId) => {
  const query = `
    INSERT INTO watchlist (auth_id, tvmaze_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rows[0];
};

const getByUser = async (authId, { limit, offset }) => {
  const query = `
    SELECT * FROM watchlist
    WHERE auth_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const result = await pool.query(query, [authId, limit, offset]);
  return result.rows;
};

const countByUser = async (authId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM watchlist
    WHERE auth_id = $1;
  `;
  const result = await pool.query(query, [authId]);
  return Number(result.rows[0].total);
};

const remove = async (authId, tvmazeId) => {
  const query = `
    DELETE FROM watchlist
    WHERE auth_id = $1 AND tvmaze_id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rows[0];
};

const exists = async (authId, tvmazeId) => {
  const query = `
    SELECT 1 FROM watchlist
    WHERE auth_id = $1 AND tvmaze_id = $2;
  `;
  const result = await pool.query(query, [authId, tvmazeId]);
  return result.rowCount > 0;
};

module.exports = {
  add,
  getByUser,
  countByUser,
  remove,
  exists
};
