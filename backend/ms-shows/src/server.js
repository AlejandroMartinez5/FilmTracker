require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor ms-shows corriendo en http://localhost:${PORT}`);
  });
}

startServer();