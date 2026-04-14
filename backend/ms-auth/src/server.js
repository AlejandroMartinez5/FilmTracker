require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const { connectBroker } = require("./utils/broker.util");

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB conectado correctamente en ms-auth");

    await connectBroker();

    app.listen(PORT, () => {
      console.log(`Servidor ms-auth corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al iniciar ms-auth:", error.message);
  });