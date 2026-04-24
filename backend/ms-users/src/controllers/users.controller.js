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

module.exports = {
  healthCheck,
  getProfile,
  updateProfile
};