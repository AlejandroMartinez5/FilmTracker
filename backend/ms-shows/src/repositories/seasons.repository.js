const Season = require('../models/season.model');

async function findByTvmazeShowId(tvmazeShowId) {
  return Season.find({ tvmazeShowId }).sort({ number: 1 });
}

async function createManySeasons(seasonsData) {
  return Season.insertMany(seasonsData);
}

module.exports = {
  findByTvmazeShowId,
  createManySeasons
};