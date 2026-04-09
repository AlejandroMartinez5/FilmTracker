const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const showsRoutes = require('./routes/shows.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('ms-shows funcionando 🚀');
});

app.use('/api/shows', showsRoutes);

module.exports = app;