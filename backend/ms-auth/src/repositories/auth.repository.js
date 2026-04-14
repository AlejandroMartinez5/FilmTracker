const Auth = require("../models/auth.model");

const findByEmail = async (email) => {
  return Auth.findOne({ email });
};

const createAuthUser = async (data) => {
  return Auth.create(data);
};

module.exports = {
  findByEmail,
  createAuthUser
};