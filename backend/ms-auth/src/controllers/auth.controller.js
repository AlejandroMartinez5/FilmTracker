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

module.exports = {
  healthCheck,
  register,
  login
};