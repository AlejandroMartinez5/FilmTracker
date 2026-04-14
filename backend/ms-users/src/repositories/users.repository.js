const User = require("../models/user.model");

const findById = async (userId) => {
  return User.findById(userId);
};

const findByAuthId = async (authId) => {
  return User.findOne({ authId });
};

const findByEmail = async (email) => {
  return User.findOne({ email });
};

const createUser = async (data) => {
  return User.create(data);
};

const updateUserById = async (userId, updateData) => {
  return User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  });
};

module.exports = {
  findById,
  findByAuthId,
  findByEmail,
  createUser,
  updateUserById
};