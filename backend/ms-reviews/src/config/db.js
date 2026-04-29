const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const testConnection = async (retries = 10, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query("SELECT 1");
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