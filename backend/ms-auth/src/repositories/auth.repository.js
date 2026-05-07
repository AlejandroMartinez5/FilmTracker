const Auth = require("../models/auth.model");

const findByEmail = async (email) => {
  return Auth.findOne({ email });
};

const findByUsername = async (username) => {
  return Auth.findOne({ username });
};

const findById = async (id) => {
  return Auth.findById(id);
};

const findByEmailVerificationToken = async (token) => {
  return Auth.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
};

const findByPasswordResetToken = async (token) => {
  return Auth.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
};

const createAuthUser = async (data) => {
  return Auth.create(data);
};

const updateById = async (id, data) => {
  return Auth.findByIdAndUpdate(id, data, { new: true });
};

const deleteById = async (id) => {
  return Auth.findByIdAndDelete(id);
};

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  findByEmailVerificationToken,
  findByPasswordResetToken,
  createAuthUser,
  updateById,
  deleteById
};
