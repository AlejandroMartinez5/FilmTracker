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

const searchUsers = async (query) => {
  return User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } }
    ]
  })
    .select("_id name username profileImage")
    .limit(20);
};

const findByUsernamePublic = async (username) => {
  return User.findOne({ username })
    .select("_id name username profileImage createdAt");
};

module.exports = {
  createUser,
  findByAuthId,
  findByEmail,
  findByUsername,
  updateUserById,
  searchUsers,
  findByUsernamePublic
};