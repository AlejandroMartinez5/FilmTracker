const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const ensureSchema = async () => {
  await pool.query(`
    ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `);

  await pool.query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_review_likes_created_review
    ON review_likes (created_at DESC, review_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_comment_likes_created_comment
    ON comment_likes (created_at DESC, comment_id)
  `);
};

const testConnection = async (retries = 10, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query("SELECT 1");
      await ensureSchema();
      console.log("PostgreSQL conectado correctamente en ms-reviews");
      return;
    } catch (error) {
      console.error(`Intento ${i}/${retries} fallido conectando a PostgreSQL`);
      console.error(error.message);

      if (i === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = {
  pool,
  testConnection
};
