const { pool } = require("../config/db");

const createComment = async ({ reviewId, authId, content }) => {
  const query = `
    INSERT INTO comments (review_id, auth_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await pool.query(query, [reviewId, authId, content]);
  return result.rows[0];
};

const findByReviewId = async (reviewId) => {
  const query = `
    SELECT 
      c.*,
      COUNT(DISTINCT cl.id) AS likes_count
    FROM comments c
    LEFT JOIN comment_likes cl ON c.id = cl.comment_id
    WHERE c.review_id = $1
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `;

  const result = await pool.query(query, [reviewId]);
  return result.rows;
};

const findById = async (commentId) => {
  const query = `
    SELECT *
    FROM comments
    WHERE id = $1
  `;

  const result = await pool.query(query, [commentId]);
  return result.rows[0];
};

const updateComment = async ({ commentId, content }) => {
  const query = `
    UPDATE comments
    SET 
      content = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [content, commentId]);
  return result.rows[0];
};

const deleteComment = async (commentId) => {
  const query = `
    DELETE FROM comments
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [commentId]);
  return result.rows[0];
};

const likeComment = async ({ commentId, authId }) => {
  const query = `
    INSERT INTO comment_likes (comment_id, auth_id)
    VALUES ($1, $2)
    ON CONFLICT (comment_id, auth_id) DO NOTHING
    RETURNING *
  `;

  const result = await pool.query(query, [commentId, authId]);
  return result.rows[0];
};

const unlikeComment = async ({ commentId, authId }) => {
  const query = `
    DELETE FROM comment_likes
    WHERE comment_id = $1 AND auth_id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [commentId, authId]);
  return result.rows[0];
};

const countLikes = async (commentId) => {
  const query = `
    SELECT COUNT(*) AS likes_count
    FROM comment_likes
    WHERE comment_id = $1
  `;

  const result = await pool.query(query, [commentId]);
  return Number(result.rows[0].likes_count);
};

module.exports = {
  createComment,
  findByReviewId,
  findById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  countLikes
};