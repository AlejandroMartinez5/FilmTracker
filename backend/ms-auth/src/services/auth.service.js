const bcrypt = require("bcrypt");
const repository = require("../repositories/auth.repository");
const { signToken } = require("../utils/jwt.util");
const { publishUserCreated } = require("../utils/broker.util");
const { requestUsernameAvailability } = require("../utils/username-check.util");

const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

const throwBadRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  throw error;
};

const isDuplicateKeyError = (error) => {
  return error?.code === 11000;
};

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
    throwBadRequest("email, password, name y username son obligatorios");
  }

  if (password.length < 6) {
    throwBadRequest("La contrasena debe tener al menos 6 caracteres");
  }

  if (normalizedName.length < 2 || normalizedName.length > 40) {
    throwBadRequest("El nombre debe tener entre 2 y 40 caracteres");
  }

  if (!usernameRegex.test(normalizedUsername)) {
    throwBadRequest(
      "El username debe tener entre 3 y 30 caracteres y solo puede contener letras, numeros, punto o guion bajo"
    );
  }

  if (profileImage && !isValidUrl(profileImage)) {
    throwBadRequest("La imagen de perfil debe ser una URL valida");
  }

  const exists = await repository.findByEmail(normalizedEmail);
  if (exists) {
    throwBadRequest("Usuario ya existe");
  }

  const usernameReserved = await repository.findByUsername(normalizedUsername);
  if (usernameReserved) {
    throwBadRequest("El username ya esta en uso");
  }

  const usernameCheck = await requestUsernameAvailability(normalizedUsername);
  if (!usernameCheck.available) {
    throwBadRequest("El username ya esta en uso");
  }

  const hashed = await bcrypt.hash(password, 10);
  let authUser;

  try {
    authUser = await repository.createAuthUser({
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashed,
      role: "USER"
    });

    await publishUserCreated({
      authId: authUser._id.toString(),
      email: authUser.email,
      role: authUser.role,
      name: normalizedName,
      username: authUser.username,
      profileImage: profileImage || null
    });
  } catch (error) {
    if (authUser) {
      await repository.deleteById(authUser._id);
    }

    if (isDuplicateKeyError(error)) {
      throwBadRequest("El email o username ya esta en uso");
    }

    throw error;
  }

  return {
    id: authUser._id,
    email: authUser.email,
    username: authUser.username,
    role: authUser.role
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throwBadRequest("email y password son obligatorios");
  }

  const user = await repository.findByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error("Credenciales invalidas");
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
      username: user.username,
      role: user.role
    },
    token
  };
};

module.exports = {
  register,
  login
};
