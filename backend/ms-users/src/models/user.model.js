const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    authId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    profileImage: {
      type: String,
      default: null
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);