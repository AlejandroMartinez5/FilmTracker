require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const { consumeUserCreated } = require("./consumers/user-created.consumer");
const { consumeUsernameCheck } = require("./consumers/username-check.consumer");

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB conectado correctamente en ms-users");

    app.listen(PORT, () => {
      console.log(`Servidor ms-users corriendo en http://localhost:${PORT}`);
    });

    consumeUserCreated();
    consumeUsernameCheck();
  })
  .catch((error) => {
    console.error("Error al iniciar ms-users:", error.message);
  });