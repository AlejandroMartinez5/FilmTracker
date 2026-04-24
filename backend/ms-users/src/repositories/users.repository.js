const User = require("../models/user.model");

const createUser = async (data) => {
  return User.create(data);
};

const findByAuthId = async (authId) => {
  return User.findOne({ authId });
};

const findByEmail = async (email) => {
  return User.findOne({ email });
};

const findByUsername = async (username) => {
  return User.findOne({ username });
};

const updateUserById = async (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

module.exports = {
  createUser,
  findByAuthId,
  findByEmail,
  findByUsername,
  updateUserById
};