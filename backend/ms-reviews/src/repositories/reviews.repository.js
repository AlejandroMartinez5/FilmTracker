const { pool } = require("../config/db");

const createReview = async ({ authId, tvmazeId, rating, title, content }) => {
  const query = `
    INSERT INTO reviews (auth_id, tvmaze_id, rating, title, content)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [authId, tvmazeId, rating, title, content];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const findById = async (reviewId) => {
  const query = `
    SELECT *
    FROM reviews
    WHERE id = $1
  `;

  const result = await pool.query(query, [reviewId]);
  return result.rows[0];
};

const findByShowId = async (tvmazeId, { limit, offset }) => {
  const query = `
    WITH paginated_reviews AS (
      SELECT *
      FROM reviews
      WHERE tvmaze_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    )
    SELECT 
      r.*,
      COUNT(DISTINCT rl.id) AS likes_count,
      COUNT(DISTINCT c.id) AS comments_count
    FROM paginated_reviews r
    LEFT JOIN review_likes rl ON r.id = rl.review_id
    LEFT JOIN comments c ON r.id = c.review_id
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(query, [tvmazeId, limit, offset]);
  return result.rows;
};

const countByShowId = async (tvmazeId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM reviews
    WHERE tvmaze_id = $1
  `;

  const result = await pool.query(query, [tvmazeId]);
  return Number(result.rows[0].total);
};

const findByUser = async (authId, { limit, offset }) => {
  const query = `
    SELECT *
    FROM reviews
    WHERE auth_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [authId, limit, offset]);
  return result.rows;
};

const countByUser = async (authId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM reviews
    WHERE auth_id = $1
  `;

  const result = await pool.query(query, [authId]);
  return Number(result.rows[0].total);
};

const updateReview = async ({ reviewId, rating, title, content }) => {
  const query = `
    UPDATE reviews
    SET 
      rating = $1,
      title = $2,
      content = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `;

  const values = [rating, title, content, reviewId];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteReview = async (reviewId) => {
  const query = `
    DELETE FROM reviews
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [reviewId]);
  return result.rows[0];
};

const likeReview = async ({ reviewId, authId }) => {
  const query = `
    INSERT INTO review_likes (review_id, auth_id)
    VALUES ($1, $2)
    ON CONFLICT (review_id, auth_id) DO NOTHING
    RETURNING *
  `;

  const result = await pool.query(query, [reviewId, authId]);
  return result.rows[0];
};

const unlikeReview = async ({ reviewId, authId }) => {
  const query = `
    DELETE FROM review_likes
    WHERE review_id = $1 AND auth_id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [reviewId, authId]);
  return result.rows[0];
};

const countLikes = async (reviewId) => {
  const query = `
    SELECT COUNT(*) AS likes_count
    FROM review_likes
    WHERE review_id = $1
  `;

  const result = await pool.query(query, [reviewId]);
  return Number(result.rows[0].likes_count);
};

module.exports = {
  createReview,
  findById,
  findByShowId,
  countByShowId,
  findByUser,
  countByUser,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  countLikes
};
