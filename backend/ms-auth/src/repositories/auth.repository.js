const Auth = require("../models/auth.model");

const findByEmail = async (email) => {
  return Auth.findOne({ email });
};

const findByUsername = async (username) => {
  return Auth.findOne({ username });
};

const createAuthUser = async (data) => {
  return Auth.create(data);
};

const deleteById = async (id) => {
  return Auth.findByIdAndDelete(id);
};

module.exports = {
  findByEmail,
  findByUsername,
  createAuthUser,
  deleteById
};
