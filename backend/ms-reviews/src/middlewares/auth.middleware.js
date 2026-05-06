const { verifyToken } = require("../utils/jwt.util");

const buildUserFromToken = (decoded) => {
  return {
    authId: decoded.authId,
    email: decoded.email,
    role: decoded.role,
    emailVerified: decoded.emailVerified === true
  };
};

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no proporcionado o formato invalido"
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

    req.user = buildUserFromToken(decoded);

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado"
      });
    }

    return res.status(401).json({
      message: "Token invalido"
    });
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no proporcionado o formato invalido"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded.authId) {
      return res.status(401).json({
        message: "El token no contiene authId"
      });
    }

    req.user = buildUserFromToken(decoded);

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expirado"
      });
    }

    return res.status(401).json({
      message: "Token invalido"
    });
  }
};

const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.emailVerified) {
    return res.status(403).json({
      message: "Debes verificar tu correo para publicar resenas o comentarios"
    });
  }

  return next();
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  requireVerifiedEmail
};
