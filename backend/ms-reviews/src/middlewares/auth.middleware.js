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

    if (!decoded.authId) {
      return res.status(401).json({
        message: "El token no contiene authId"
      });
    }

    if (!decoded.role) {
      return res.status(401).json({
        message: "El token no contiene role"
      });
    }

    req.user = {
      authId: decoded.authId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado"
      });
    }

    return res.status(401).json({
      message: "Token inválido"
    });
  }
};

module.exports = {
  authenticateToken
};