const validateInternalRequest = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];

  if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      message: "Acceso interno no autorizado"
    });
  }

  next();
};

module.exports = {
  validateInternalRequest
};