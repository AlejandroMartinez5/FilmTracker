const Show = require('../models/show.model');

async function findByTvmazeId(tvmazeId) {
  return Show.findOne({ tvmazeId });
}

async function createShow(showData) {
  return Show.create(showData);
}

module.exports = {
  findByTvmazeId,
  createShow
};