const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 3004,
  databaseUrl: process.env.DATABASE_URL
};