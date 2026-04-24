const bcrypt = require("bcrypt");
const repository = require("../repositories/auth.repository");
const { signToken } = require("../utils/jwt.util");
const { publishUserCreated } = require("../utils/broker.util");
const { requestUsernameAvailability } = require("../utils/username-check.util");

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const register = async ({ email, password, name, username, profileImage }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedName = name?.trim();
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedEmail || !password || !normalizedName || !normalizedUsername) {
    const error = new Error("email, password, name y username son obligatorios");
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("La contraseña debe tener al menos 6 caracteres");
    error.status = 400;
    throw error;
  }

  if (normalizedName.length < 2 || normalizedName.length > 40) {
    const error = new Error("El nombre debe tener entre 2 y 40 caracteres");
    error.status = 400;
    throw error;
  }

  if (!usernameRegex.test(normalizedUsername)) {
    const error = new Error(
      "El username debe tener entre 3 y 30 caracteres y solo puede contener letras, números, punto o guion bajo"
    );
    error.status = 400;
    throw error;
  }

  if (profileImage && !isValidUrl(profileImage)) {
    const error = new Error("La imagen de perfil debe ser una URL válida");
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
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    const error = new Error("email y password son obligatorios");
    error.status = 400;
    throw error;
  }

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