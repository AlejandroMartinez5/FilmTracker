const { verifyToken } = require("../utils/jwt.util");

const buildUserFromToken = (decoded) => {
  return {
    authId: decoded.authId,
    email: decoded.email,
    role: decoded.role,
    accountStatus: decoded.accountStatus || "ACTIVE",
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

    if (decoded.accountStatus === "BANNED") {
      return res.status(403).json({
        message: "Cuenta baneada"
      });
    }

    if (decoded.accountStatus === "SUSPENDED") {
      return res.status(403).json({
        message: "Cuenta suspendida temporalmente"
      });
    }

    req.authToken = token;
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

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Se requiere rol de administrador"
    });
  }

  return next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
