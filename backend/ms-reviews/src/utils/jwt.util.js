const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const getPublicKey = () => {
  const publicKeyPath =
    process.env.JWT_PUBLIC_KEY_PATH || "./src/keys/public.key";

  const resolvedPath = path.resolve(publicKeyPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`No se encontró la llave pública en: ${resolvedPath}`);
  }

  return fs.readFileSync(resolvedPath, "utf8");
};

const verifyToken = (token) => {
  const publicKey = getPublicKey();

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"]
  });
};

module.exports = {
  verifyToken
};
