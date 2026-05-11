const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const publicKey = fs.readFileSync(
  process.env.JWT_PUBLIC_KEY_PATH ||
    path.join(__dirname, "../keys/public.key"),
  "utf8"
);

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"]
  });
};

module.exports = {
  verifyToken
};
