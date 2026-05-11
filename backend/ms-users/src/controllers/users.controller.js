const usersService = require("../services/users.service");

const healthCheck = async (req, res) => {
  return res.status(200).json({
    message: "ms-users funcionando 🚀"
  });
};

const getProfile = async (req, res) => {
  try {
    const authId = req.user.authId;
    const profile = await usersService.getProfile(authId);

    return res.status(200).json({
      message: "Perfil obtenido correctamente",
      data: profile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    const users = await usersService.searchUsers(q);

    return res.status(200).json({
      message: "Usuarios encontrados",
      data: users
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const searchUsersForAdmin = async (req, res) => {
  try {
    const { q } = req.query;

    const users = await usersService.searchUsersForAdmin(q);

    return res.status(200).json({
      message: "Usuarios encontrados",
      data: users
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getAdminProfileByAuthId = async (req, res) => {
  try {
    const { authId } = req.params;

    const profile = await usersService.getAdminProfileByAuthId(authId);

    return res.status(200).json({
      message: "Perfil admin obtenido correctamente",
      data: profile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const authId = req.user.authId;
    const { name, username, profileImage } = req.body;

    const updatedProfile = await usersService.updateProfile(authId, {
      name,
      username,
      profileImage
    });

    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      data: updatedProfile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getPublicProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await usersService.getPublicProfileByUsername(username);

    return res.status(200).json({
      message: "Perfil público obtenido correctamente",
      data: profile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const authId = req.user.authId;
    const updatedProfile = await usersService.uploadProfilePhoto(authId, req.file);

    return res.status(200).json({
      message: "Foto de perfil actualizada correctamente",
      data: updatedProfile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al subir la foto de perfil"
    });
  }
};

const removeProfilePhoto = async (req, res) => {
  try {
    const { authId } = req.params;
    const updatedProfile = await usersService.removeProfilePhoto(authId, req.user);

    return res.status(200).json({
      message: "Foto de perfil removida correctamente",
      data: updatedProfile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error al remover la foto de perfil"
    });
  }
};

const getPublicProfileByAuthId = async (req, res) => {
  try {
    const { authId } = req.params;

    const profile = await usersService.getPublicProfileByAuthId(authId);

    return res.status(200).json({
      message: "Perfil pÃºblico obtenido correctamente",
      data: profile
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  healthCheck,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  searchUsers,
  searchUsersForAdmin,
  getAdminProfileByAuthId,
  getPublicProfileByUsername,
  getPublicProfileByAuthId
};
