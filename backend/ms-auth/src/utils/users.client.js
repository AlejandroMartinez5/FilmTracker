const axios = require("axios");

const usersApi = axios.create({
  baseURL: process.env.USERS_SERVICE_URL,
  timeout: 10000,
  headers: {
    "x-internal-key": process.env.INTERNAL_API_KEY
  }
});

const createUserProfile = async ({ authId, email, role, name = null, profileImage = null }) => {
  const response = await usersApi.post("/api/users/internal", {
    authId,
    email,
    role,
    name,
    profileImage
  });

  return response.data;
};

module.exports = {
  createUserProfile
};