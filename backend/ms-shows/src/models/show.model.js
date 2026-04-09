const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    tvmazeId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    type: String,
    language: String,
    genres: [String],
    status: String,
    runtime: Number,
    averageRuntime: Number,
    premiered: String,
    ended: String,
    officialSite: String,
    rating: {
      average: Number
    },
    image: {
      medium: String,
      original: String
    },
    summary: String,
    tvmazeUpdated: Number,
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'shows'
  }
);

module.exports = mongoose.model('Show', showSchema);