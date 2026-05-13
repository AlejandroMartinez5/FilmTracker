const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      recipient_auth_id VARCHAR(255) NOT NULL,
      actor_auth_id VARCHAR(255),
      type VARCHAR(80) NOT NULL,
      title VARCHAR(140) NOT NULL,
      body TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
    ON notifications (recipient_auth_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON notifications (recipient_auth_id, created_at DESC)
    WHERE read_at IS NULL;

    CREATE INDEX IF NOT EXISTS idx_notifications_type
    ON notifications (type);
  `);

  console.log("Tabla notifications verificada/creada");
};

const testConnection = async (retries = 10, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("PostgreSQL conectado correctamente en ms-notifications");

      await createTables();
      return;
    } catch (error) {
      console.error(
        `Intento ${attempt}/${retries} fallido conectando a PostgreSQL: ${error.message}`
      );

      if (attempt === retries) {
        throw error;
      }

      await wait(delay);
    }
  }
};

module.exports = {
  pool,
  testConnection
};
