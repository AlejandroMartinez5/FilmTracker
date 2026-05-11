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

const updateUserByAuthId = async (authId, data) => {
  return User.findOneAndUpdate({ authId }, data, { new: true });
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

const searchUsersForAdmin = async (query) => {
  return User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ]
  })
    .select("_id authId name username email profileImage role isEmailVerified createdAt updatedAt")
    .limit(20);
};

const findByUsernamePublic = async (username) => {
  return User.findOne({ username })
    .select("_id authId name username profileImage createdAt");
};

const findByAuthIdPublic = async (authId) => {
  return User.findOne({ authId })
    .select("_id authId name username profileImage createdAt");
};

module.exports = {
  createUser,
  findByAuthId,
  findByEmail,
  findByUsername,
  updateUserById,
  updateUserByAuthId,
  searchUsers,
  searchUsersForAdmin,
  findByUsernamePublic,
  findByAuthIdPublic
};
