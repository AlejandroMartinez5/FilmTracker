const usersService = require("../services/users.service");

const healthCheck = (req, res) => {
  res.json({ status: "ok" });
};

const getProfile = async (req, res) => {
  try {
    const { authId } = req.user;
    const profile = await usersService.getProfile(authId);

    res.status(200).json(profile);
  } catch (error) {
    res.status(error.status || 500).json({
      message: "Error al obtener el perfil",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { authId } = req.user;
    const { name, profileImage } = req.body;

    const updatedUser = await usersService.updateProfile(authId, {
      name,
      profileImage
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(error.status || 500).json({
      message: "Error al actualizar el perfil",
      error: error.message
    });
  }
};

module.exports = {
  healthCheck,
  getProfile,
  updateProfile
};