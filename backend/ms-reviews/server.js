require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`ms-reviews corriendo en puerto ${PORT}`);
  });
};

startServer();