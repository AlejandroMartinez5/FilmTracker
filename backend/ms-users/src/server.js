require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const { consumeUserCreated } = require("./consumers/user-created.consumer");

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB conectado correctamente en ms-users");

    await consumeUserCreated();

    app.listen(PORT, () => {
      console.log(`Servidor ms-users corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al iniciar ms-users:", error.message);
  });