const usersRepository = require("../repositories/users.repository");

const createInitialProfile = async ({
  authId,
  email,
  role = "USER",
  name = null,
  profileImage = null
}) => {
  if (!authId || !email) {
    const error = new Error("authId y email son obligatorios");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingByAuthId = await usersRepository.findByAuthId(authId);
  if (existingByAuthId) {
    return existingByAuthId;
  }

  const existingByEmail = await usersRepository.findByEmail(normalizedEmail);
  if (existingByEmail) {
    return existingByEmail;
  }

  const user = await usersRepository.createUser({
    authId,
    email: normalizedEmail,
    role,
    name: name?.trim() || null,
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
    email: user.email,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const updateProfile = async (authId, { name, profileImage }) => {
  const user = await usersRepository.findByAuthId(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  const updateData = {};

  if (name !== undefined) {
    if (!name.trim()) {
      const error = new Error("El nombre no puede estar vacío");
      error.status = 400;
      throw error;
    }

    updateData.name = name.trim();
  }

  if (profileImage !== undefined) {
    updateData.profileImage = profileImage;
  }

  const updatedUser = await usersRepository.updateUserById(user._id, updateData);

  return {
    id: updatedUser._id,
    authId: updatedUser.authId,
    name: updatedUser.name,
    email: updatedUser.email,
    profileImage: updatedUser.profileImage,
    isEmailVerified: updatedUser.isEmailVerified,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt
  };
};

module.exports = {
  createInitialProfile,
  getProfile,
  updateProfile
};