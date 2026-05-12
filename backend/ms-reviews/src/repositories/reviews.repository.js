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

const findByShowId = async (tvmazeId, { limit, offset }, authId = null) => {
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
      COALESCE(rl.likes_count, 0) AS likes_count,
      COALESCE(c.comments_count, 0) AS comments_count,
      EXISTS (
        SELECT 1
        FROM review_likes user_like
        WHERE user_like.review_id = r.id
          AND user_like.auth_id = $4
      ) AS liked_by_me
    FROM paginated_reviews r
    LEFT JOIN (
      SELECT review_id, COUNT(*) AS likes_count
      FROM review_likes
      GROUP BY review_id
    ) rl ON r.id = rl.review_id
    LEFT JOIN (
      SELECT review_id, COUNT(*) AS comments_count
      FROM comments
      GROUP BY review_id
    ) c ON r.id = c.review_id
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(query, [tvmazeId, limit, offset, authId]);
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

const countLikesReceivedByUser = async (authId) => {
  const query = `
    SELECT COUNT(rl.id) AS total_likes
    FROM reviews r
    LEFT JOIN review_likes rl ON rl.review_id = r.id
    WHERE r.auth_id = $1
  `;

  const result = await pool.query(query, [authId]);
  return Number(result.rows[0].total_likes);
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

const updateReviewImage = async ({ reviewId, imageUrl }) => {
  const query = `
    UPDATE reviews
    SET
      image_url = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [imageUrl, reviewId]);
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

const getAdminStats = async ({ days = 30, limit = 5 } = {}) => {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 365);
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);

  const [
    totalsResult,
    reviewsPerDayResult,
    likesPerDayResult,
    topCommentsResult,
    topCommentersResult,
    topReviewsResult,
    topLikedCommentsResult
  ] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM reviews)::int AS total_reviews,
        (SELECT COUNT(*) FROM comments)::int AS total_comments,
        (SELECT COUNT(*) FROM review_likes)::int AS total_review_likes,
        (SELECT COUNT(*) FROM comment_likes)::int AS total_comment_likes,
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS average_rating
      FROM reviews
    `),
    pool.query(
      `
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - (($1::int - 1) * INTERVAL '1 day'),
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS day
        )
        SELECT
          days.day,
          COALESCE(COUNT(reviews.id), 0)::int AS count
        FROM days
        LEFT JOIN reviews ON DATE(reviews.created_at) = days.day
        GROUP BY days.day
        ORDER BY days.day ASC
      `,
      [safeDays]
    ),
    pool.query(
      `
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - (($1::int - 1) * INTERVAL '1 day'),
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS day
        ),
        review_counts AS (
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM review_likes
          WHERE created_at >= CURRENT_DATE - (($1::int - 1) * INTERVAL '1 day')
          GROUP BY DATE(created_at)
        ),
        comment_counts AS (
          SELECT DATE(created_at) AS day, COUNT(*)::int AS count
          FROM comment_likes
          WHERE created_at >= CURRENT_DATE - (($1::int - 1) * INTERVAL '1 day')
          GROUP BY DATE(created_at)
        )
        SELECT
          days.day,
          COALESCE(review_counts.count, 0) AS review_likes,
          COALESCE(comment_counts.count, 0) AS comment_likes,
          COALESCE(review_counts.count, 0) + COALESCE(comment_counts.count, 0) AS total_likes
        FROM days
        LEFT JOIN review_counts ON review_counts.day = days.day
        LEFT JOIN comment_counts ON comment_counts.day = days.day
        ORDER BY days.day ASC
      `,
      [safeDays]
    ),
    pool.query(
      `
        SELECT
          c.id,
          c.review_id,
          c.auth_id,
          c.content,
          c.image_url,
          c.created_at,
          COUNT(cl.id)::int AS likes_count
        FROM comments c
        LEFT JOIN comment_likes cl ON cl.comment_id = c.id
        GROUP BY c.id
        ORDER BY likes_count DESC, c.created_at DESC
        LIMIT $1
      `,
      [safeLimit]
    ),
    pool.query(
      `
        SELECT
          auth_id,
          COUNT(*)::int AS comments_count
        FROM comments
        GROUP BY auth_id
        ORDER BY comments_count DESC
        LIMIT $1
      `,
      [safeLimit]
    ),
    pool.query(
      `
        SELECT
          r.id,
          r.auth_id,
          r.tvmaze_id,
          r.rating,
          r.title,
          r.content,
          r.image_url,
          r.created_at,
          COUNT(rl.id)::int AS likes_count
        FROM reviews r
        LEFT JOIN review_likes rl ON rl.review_id = r.id
        GROUP BY r.id
        ORDER BY likes_count DESC, r.created_at DESC
        LIMIT $1
      `,
      [safeLimit]
    ),
    pool.query(
      `
        SELECT
          c.id,
          c.review_id,
          c.auth_id,
          c.content,
          c.image_url,
          c.created_at,
          COUNT(cl.id)::int AS likes_count
        FROM comments c
        LEFT JOIN comment_likes cl ON cl.comment_id = c.id
        GROUP BY c.id
        ORDER BY likes_count DESC, c.created_at DESC
        LIMIT $1
      `,
      [safeLimit]
    )
  ]);

  const totals = totalsResult.rows[0];
  const totalReviews = Number(totals.total_reviews);
  const totalComments = Number(totals.total_comments);
  const totalReviewLikes = Number(totals.total_review_likes);
  const totalCommentLikes = Number(totals.total_comment_likes);

  return {
    totals: {
      reviews: totalReviews,
      comments: totalComments,
      reviewLikes: totalReviewLikes,
      commentLikes: totalCommentLikes,
      likes: totalReviewLikes + totalCommentLikes,
      averageRating: Number(totals.average_rating)
    },
    reviewsPerDay: reviewsPerDayResult.rows,
    likesPerDay: likesPerDayResult.rows,
    topComments: topCommentsResult.rows,
    topCommenters: topCommentersResult.rows,
    topLikedContent: {
      reviews: topReviewsResult.rows,
      comments: topLikedCommentsResult.rows
    },
    ratios: {
      reviewLikesPerReview:
        totalReviews > 0 ? Number((totalReviewLikes / totalReviews).toFixed(2)) : 0,
      commentLikesPerComment:
        totalComments > 0 ? Number((totalCommentLikes / totalComments).toFixed(2)) : 0
    },
    period: {
      days: safeDays
    }
  };
};

module.exports = {
  createReview,
  findById,
  findByShowId,
  countByShowId,
  findByUser,
  countByUser,
  countLikesReceivedByUser,
  updateReview,
  deleteReview,
  updateReviewImage,
  likeReview,
  unlikeReview,
  countLikes,
  getAdminStats
};
