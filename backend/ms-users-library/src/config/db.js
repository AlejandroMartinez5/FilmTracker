const { Pool } = require("pg");
const { databaseUrl } = require("./env");

const pool = new Pool({
  connectionString: databaseUrl
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      auth_id VARCHAR(255) NOT NULL,
      tvmaze_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (auth_id, tvmaze_id),
      CHECK (tvmaze_id > 0)
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      auth_id VARCHAR(255) NOT NULL,
      tvmaze_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (auth_id, tvmaze_id),
      CHECK (tvmaze_id > 0)
    );
  `);

  console.log("Tablas favorites y watchlist verificadas/creadas");
};

const testConnection = async (retries = 10, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("PostgreSQL conectado correctamente en ms-users-library");

      await createTables();

      return;
    } catch (error) {
      console.error(
        `Intento ${attempt}/${retries} - Error al conectar PostgreSQL: ${error.message}`
      );

      if (attempt === retries) {
        process.exit(1);
      }

      await wait(delay);
    }
  }
};

module.exports = {
  pool,
  testConnection
};