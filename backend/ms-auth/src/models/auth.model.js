const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
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

module.exports = mongoose.model("Auth", authSchema);