const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema(
  {
    tvmazeSeasonId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    tvmazeShowId: {
      type: Number,
      required: true,
      index: true
    },
    number: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      default: null
    },
    episodeOrder: {
      type: Number,
      default: null
    },
    premiereDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    image: {
      medium: String,
      original: String
    },
    summary: {
      type: String,
      default: null
    },
    tvmazeUpdated: {
      type: Number,
      default: null
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'seasons'
  }
);

module.exports = mongoose.model('Season', seasonSchema);