const authService = require("../services/auth.service");

const healthCheck = async (req, res) => {
  return res.status(200).json({
    message: "ms-auth funcionando 🚀"
  });
};

const register = async (req, res) => {
  try {
    const { email, password, name, username, profileImage } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({
        message: "email, password, name y username son obligatorios"
      });
    }

    const result = await authService.register({
      email,
      password,
      name,
      username,
      profileImage
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email y password son obligatorios"
      });
    }

    const result = await authService.login({ email, password });

    return res.status(200).json({
      message: "Login exitoso",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const result = await authService.verifyEmail({ email, code });

    return res.status(200).json({
      message: "Correo verificado correctamente",
      data: result
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.resendVerificationEmail({ email });

    return res.status(200).json({
      message: "Si el correo existe y no esta verificado, se enviaron instrucciones"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword({ email });

    return res.status(200).json({
      message: "Si el correo existe, se enviaron instrucciones para recuperar la contrasena"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, code, password } = req.body;

    await authService.resetPassword({ token: token || code, password });

    return res.status(200).json({
      message: "Contrasena actualizada correctamente"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const authId = req.user.authId;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword({
      authId,
      currentPassword,
      newPassword
    });

    return res.status(200).json({
      message: "Contrasena cambiada correctamente"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  healthCheck,
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword
};
