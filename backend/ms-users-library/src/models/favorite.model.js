const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    tvmazeId: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ userId: 1, tvmazeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);