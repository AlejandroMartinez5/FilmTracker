const Show = require('../models/show.model');

async function findByTvmazeId(tvmazeId) {
  return Show.findOne({ tvmazeId });
}

async function createShow(showData) {
  return Show.create(showData);
}

async function getFeatured(limit = 10) {
  return Show.find({
    'image.medium': { $ne: null }
  })
    .sort({ tvmazeId: 1 })
    .limit(limit);
}

async function getTopRated(limit = 10) {
  return Show.find({
    'rating.average': { $ne: null }
  })
    .sort({ 'rating.average': -1 })
    .limit(limit);
}

async function getRecent(limit = 10) {
  return Show.find({
    premiered: { $ne: null }
  })
    .sort({ premiered: -1 })
    .limit(limit);
}

async function getByStatus(status, limit = 10) {
  return Show.find({
    status,
    averageRuntime: { $ne: null }
})
    .sort({ averageRuntime: 1 })
    .limit(limit);
}

async function getShowsByGenre(genre, limit = 10) {
  return Show.find({
    genres: genre,
    'rating.average': { $ne: null }
  })
    .sort({ 'rating.average': -1 })
    .limit(limit);
}

module.exports = {
  findByTvmazeId,
  createShow,
  getFeatured,
  getTopRated,
  getRecent,
  getByStatus,
  getShowsByGenre
};
