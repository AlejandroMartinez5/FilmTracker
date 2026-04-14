const { verifyToken } = require("../utils/jwt.util");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no proporcionado o formato inválido"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = {
      authId: decoded.authId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado"
    });
  }
};

module.exports = {
  authenticateToken
};