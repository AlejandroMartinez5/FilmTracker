const usersRepository = require("../repositories/users.repository");

const createInitialProfile = async ({
  authId,
  email,
  role = "USER",
  name,
  username,
  profileImage = null
}) => {
  if (!authId || !email || !name || !username) {
    const error = new Error("authId, email, name y username son obligatorios");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedName) {
    const error = new Error("El nombre es obligatorio");
    error.status = 400;
    throw error;
  }

  if (!normalizedUsername) {
    const error = new Error("El username es obligatorio");
    error.status = 400;
    throw error;
  }

  const existingByAuthId = await usersRepository.findByAuthId(authId);
  if (existingByAuthId) {
    return existingByAuthId;
  }

  const existingByEmail = await usersRepository.findByEmail(normalizedEmail);
  if (existingByEmail) {
    return existingByEmail;
  }

  const existingByUsername = await usersRepository.findByUsername(normalizedUsername);
  if (existingByUsername) {
    const error = new Error("El username ya está en uso");
    error.status = 400;
    throw error;
  }

  const user = await usersRepository.createUser({
    authId,
    email: normalizedEmail,
    role,
    name: normalizedName,
    username: normalizedUsername,
    profileImage
  });

  return user;
};

const getProfile = async (authId) => {
  const user = await usersRepository.findByAuthId(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return {
    id: user._id,
    authId: user.authId,
    name: user.name,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const updateProfile = async (authId, { name, username, profileImage }) => {
  const user = await usersRepository.findByAuthId(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      const error = new Error("El nombre no puede estar vacío");
      error.status = 400;
      throw error;
    }

    updateData.name = normalizedName;
  }

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      const error = new Error("El username no puede estar vacío");
      error.status = 400;
      throw error;
    }

    const existingUser = await usersRepository.findByUsername(normalizedUsername);

    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      const error = new Error("El username ya está en uso");
      error.status = 400;
      throw error;
    }

    updateData.username = normalizedUsername;
  }

  if (profileImage !== undefined) {
    updateData.profileImage = profileImage;
  }

  const updatedUser = await usersRepository.updateUserById(user._id, updateData);

  return {
    id: updatedUser._id,
    authId: updatedUser.authId,
    name: updatedUser.name,
    username: updatedUser.username,
    email: updatedUser.email,
    profileImage: updatedUser.profileImage,
    isEmailVerified: updatedUser.isEmailVerified,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };
};

const checkUsernameAvailability = async (username) => {
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername) {
    const error = new Error("El username es obligatorio");
    error.status = 400;
    throw error;
  }

  const existingUser = await usersRepository.findByUsername(normalizedUsername);

  return {
    available: !existingUser
  };
};

const searchUsers = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.trim();

  const users = await usersRepository.searchUsers(q);

  return users.map(user => ({
    id: user._id,
    name: user.name,
    username: user.username,
    profileImage: user.profileImage
  }));
};

module.exports = {
  createInitialProfile,
  getProfile,
  updateProfile,
  checkUsernameAvailability,
  searchUsers
};