const usersRepository = require("../repositories/users.repository");
const mediaClient = require("../clients/media.client");

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const validateName = (name) => {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    const error = new Error("El nombre es obligatorio");
    error.status = 400;
    throw error;
  }

  if (normalizedName.length < 2 || normalizedName.length > 40) {
    const error = new Error("El nombre debe tener entre 2 y 40 caracteres");
    error.status = 400;
    throw error;
  }

  return normalizedName;
};

const validateUsername = (username) => {
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername) {
    const error = new Error("El username es obligatorio");
    error.status = 400;
    throw error;
  }

  if (!usernameRegex.test(normalizedUsername)) {
    const error = new Error(
      "El username debe tener entre 3 y 30 caracteres y solo puede contener letras, números, punto o guion bajo"
    );
    error.status = 400;
    throw error;
  }

  return normalizedUsername;
};

const validateProfileImage = (profileImage) => {
  if (profileImage && !isValidUrl(profileImage)) {
    const error = new Error("La imagen de perfil debe ser una URL válida");
    error.status = 400;
    throw error;
  }

  return profileImage || null;
};

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
  const normalizedName = validateName(name);
  const normalizedUsername = validateUsername(username);
  const normalizedProfileImage = validateProfileImage(profileImage);

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
    profileImage: normalizedProfileImage
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

  if (username !== undefined) {
    const error = new Error(
      "El username se actualiza desde el servicio de autenticacion"
    );
    error.status = 400;
    throw error;
  }

  if (name !== undefined) {
    updateData.name = validateName(name);
  }

  if (profileImage !== undefined) {
    updateData.profileImage = validateProfileImage(profileImage);
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
  const normalizedUsername = validateUsername(username);

  const existingUser = await usersRepository.findByUsername(normalizedUsername);

  return {
    available: !existingUser
  };
};

const markEmailVerified = async ({ authId, emailVerified }) => {
  const normalizedAuthId = authId?.trim();

  if (!normalizedAuthId) {
    const error = new Error("authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const updatedUser = await usersRepository.updateUserByAuthId(normalizedAuthId, {
    isEmailVerified: emailVerified === true
  });

  if (!updatedUser) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return updatedUser;
};

const syncUsernameFromAuth = async ({ authId, username }) => {
  const normalizedAuthId = authId?.trim();
  const normalizedUsername = validateUsername(username);

  if (!normalizedAuthId) {
    const error = new Error("authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const updatedUser = await usersRepository.updateUserByAuthId(normalizedAuthId, {
    username: normalizedUsername
  });

  if (!updatedUser) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return updatedUser;
};

const searchUsers = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.trim();

  const users = await usersRepository.searchUsers(q);

  return users.map((user) => ({
    id: user._id,
    name: user.name,
    username: user.username,
    profileImage: user.profileImage
  }));
};

const searchUsersForAdmin = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  const q = query.trim();
  const users = await usersRepository.searchUsersForAdmin(q);

  return users.map((user) => ({
    id: user._id,
    authId: user.authId,
    name: user.name,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
};

const getAdminProfileByAuthId = async (authId) => {
  const normalizedAuthId = authId?.trim();

  if (!normalizedAuthId) {
    const error = new Error("El authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const user = await usersRepository.findByAuthId(normalizedAuthId);

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
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const getPublicProfileByUsername = async (username) => {
  const normalizedUsername = validateUsername(username);

  const user = await usersRepository.findByUsernamePublic(normalizedUsername);

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
    profileImage: user.profileImage,
    createdAt: user.createdAt
  };
};

const uploadProfilePhoto = async (authId, file) => {
  if (!file) {
    const error = new Error("La imagen de perfil es obligatoria");
    error.status = 400;
    throw error;
  }

  const user = await usersRepository.findByAuthId(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  try {
    const media = await mediaClient.uploadProfilePhoto({
      authId,
      file
    });

    const updatedUser = await usersRepository.updateUserById(user._id, {
      profileImage: media.url
    });

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
      updatedAt: updatedUser.updatedAt,
      media
    };
  } catch (error) {
    const customError = new Error(error.details || error.message);
    customError.status = error.code === 3 ? 400 : 502;
    throw customError;
  }
};

const removeProfilePhoto = async (authId, user) => {
  const normalizedAuthId = authId?.trim();

  if (!normalizedAuthId) {
    const error = new Error("El authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const isOwner = normalizedAuthId === user.authId;
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    const error = new Error("No tienes permisos para quitar esta foto de perfil");
    error.status = 403;
    throw error;
  }

  const targetUser = await usersRepository.findByAuthId(normalizedAuthId);

  if (!targetUser) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  const updatedUser = await usersRepository.updateUserById(targetUser._id, {
    profileImage: null
  });

  await Promise.allSettled([
    mediaClient.deleteProfilePhoto(normalizedAuthId)
  ]);

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

const getPublicProfileByAuthId = async (authId) => {
  const normalizedAuthId = authId?.trim();

  if (!normalizedAuthId) {
    const error = new Error("El authId es obligatorio");
    error.status = 400;
    throw error;
  }

  const user = await usersRepository.findByAuthIdPublic(normalizedAuthId);

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
    profileImage: user.profileImage,
    createdAt: user.createdAt
  };
};

module.exports = {
  createInitialProfile,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  checkUsernameAvailability,
  markEmailVerified,
  syncUsernameFromAuth,
  searchUsers,
  searchUsersForAdmin,
  getAdminProfileByAuthId,
  getPublicProfileByUsername,
  getPublicProfileByAuthId
};
