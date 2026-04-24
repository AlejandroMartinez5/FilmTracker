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

const getByUser = async (authId) => {
  const query = `
    SELECT * FROM watchlist
    WHERE auth_id = $1
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [authId]);
  return result.rows;
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
  remove,
  exists
};