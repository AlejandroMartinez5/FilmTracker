const app = require("./app");
const { testConnection } = require("./config/db");
const { port } = require("./config/env");

const startServer = async () => {
  try {
    await testConnection();

    app.listen(port, () => {
      console.log(`Servidor ms-users-library corriendo en http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();