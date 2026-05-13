const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

let publicKey = null;

const getPublicKey = () => {
  if (publicKey) {
    return publicKey;
  }

  const configuredPath = process.env.JWT_PUBLIC_KEY_PATH || "./src/keys/public.key";
  const keyPath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);

  publicKey = fs.readFileSync(keyPath, "utf8");
  return publicKey;
};

const verifyToken = (token) => {
  return jwt.verify(token, getPublicKey(), {
    algorithms: ["RS256"]
  });
};

module.exports = {
  verifyToken
};
