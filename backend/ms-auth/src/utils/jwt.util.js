const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync(
  path.join(__dirname, "../keys/private.key"),
  "utf8"
);

const publicKey = fs.readFileSync(
  path.join(__dirname, "../keys/public.key"),
  "utf8"
);

const signToken = (payload) => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "1h"
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"]
  });
};

module.exports = {
  signToken,
  verifyToken
};