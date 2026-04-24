const bcrypt = require("bcrypt");
const repository = require("../repositories/auth.repository");
const { signToken } = require("../utils/jwt.util");
const { publishUserCreated } = require("../utils/broker.util");
const { requestUsernameAvailability } = require("../utils/username-check.util");

const register = async ({ email, password, name, username, profileImage }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name?.trim();
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedName) {
    const error = new Error("El nombre es obligatorio");
    error.status = 400;
    throw error;
  }

  if (!normalizedUsername) {
    const error = new Error("El username es obligatorio");
    error.status = 400;
    throw error;
  }

  const exists = await repository.findByEmail(normalizedEmail);
  if (exists) {
    const error = new Error("Usuario ya existe");
    error.status = 400;
    throw error;
  }

  const usernameCheck = await requestUsernameAvailability(normalizedUsername);

  if (!usernameCheck.available) {
    const error = new Error("El username ya está en uso");
    error.status = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);

  const authUser = await repository.createAuthUser({
    email: normalizedEmail,
    password: hashed,
    role: "USER"
  });

  await publishUserCreated({
    authId: authUser._id.toString(),
    email: authUser.email,
    role: authUser.role,
    name: normalizedName,
    username: normalizedUsername,
    profileImage: profileImage || null
  });

  return {
    id: authUser._id,
    email: authUser.email,
    role: authUser.role
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await repository.findByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  const token = signToken({
    authId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    },
    token
  };
};

module.exports = {
  register,
  login
};