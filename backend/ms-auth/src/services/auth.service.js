const bcrypt = require("bcrypt");
const crypto = require("crypto");
const repository = require("../repositories/auth.repository");
const { signToken } = require("../utils/jwt.util");
const {
  publishUserCreated,
  publishUserEmailVerified,
  publishUsernameUpdated
} = require("../utils/broker.util");
const { requestUsernameAvailability } = require("../utils/username-check.util");
const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require("../utils/email.util");

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

const createNumericCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const addHours = (hours) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

const addMinutes = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

const buildVerificationData = () => {
  const code = createNumericCode();

  return {
    code,
    hashedCode: hashToken(code),
    expires: addMinutes(15)
  };
};

const validateUsername = (username) => {
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername) {
    throwBadRequest("username es obligatorio");
  }

  if (!usernameRegex.test(normalizedUsername)) {
    throwBadRequest(
      "El username debe tener entre 3 y 30 caracteres y solo puede contener letras, numeros, punto o guion bajo"
    );
  }

  return normalizedUsername;
};

const buildAccountStatusResponse = (user) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    accountStatus: user.accountStatus,
    suspendedUntil: user.suspendedUntil,
    moderationReason: user.moderationReason,
    moderatedAt: user.moderatedAt,
    moderatedByAuthId: user.moderatedByAuthId
  };
};

const ensureAccountCanLogin = async (user) => {
  if (user.accountStatus === "BANNED") {
    const error = new Error("Cuenta baneada");
    error.status = 403;
    error.data = {
      accountStatus: user.accountStatus,
      moderationReason: user.moderationReason,
      moderatedAt: user.moderatedAt
    };
    throw error;
  }

  if (user.accountStatus === "SUSPENDED") {
    if (user.suspendedUntil && user.suspendedUntil <= new Date()) {
      user.accountStatus = "ACTIVE";
      user.suspendedUntil = null;
      user.moderationReason = null;
      user.moderatedAt = null;
      user.moderatedByAuthId = null;
      await user.save();
      return;
    }

    const error = new Error("Cuenta suspendida temporalmente");
    error.status = 403;
    error.data = {
      accountStatus: user.accountStatus,
      suspendedUntil: user.suspendedUntil,
      moderationReason: user.moderationReason,
      moderatedAt: user.moderatedAt
    };
    throw error;
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

  validateUsername(normalizedUsername);

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
  const verification = buildVerificationData();
  let authUser;

  try {
    authUser = await repository.createAuthUser({
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashed,
      role: "USER",
      emailVerified: false,
      emailVerificationToken: verification.hashedCode,
      emailVerificationExpires: verification.expires
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

  let verificationEmailSent = false;

  try {
    const mailResult = await sendVerificationEmail({
      email: authUser.email,
      code: verification.code
    });

    verificationEmailSent = mailResult.sent;
  } catch (error) {
    console.error("Error al enviar correo de verificacion:", error.message);
  }

  return {
    id: authUser._id,
    email: authUser.email,
    username: authUser.username,
    role: authUser.role,
    accountStatus: authUser.accountStatus,
    emailVerified: authUser.emailVerified,
    verificationEmailSent
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

  await ensureAccountCanLogin(user);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const token = signToken({
    authId: user._id.toString(),
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified
    },
    token
  };
};

const verifyEmail = async ({ email, code }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedCode = code?.trim();

  if (!normalizedEmail || !normalizedCode) {
    throwBadRequest("email y code son obligatorios");
  }

  const user = await repository.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Codigo de verificacion invalido o expirado");
    error.status = 400;
    throw error;
  }

  if (user.emailVerified) {
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified
    };
  }

  if (
    user.emailVerificationToken !== hashToken(normalizedCode) ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires <= new Date()
  ) {
    const error = new Error("Codigo de verificacion invalido o expirado");
    error.status = 400;
    throw error;
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  await publishUserEmailVerified({
    authId: user._id.toString(),
    emailVerified: user.emailVerified
  });

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    emailVerified: user.emailVerified
  };
};

const updateUsername = async ({ authId, username }) => {
  if (!authId) {
    const error = new Error("No autorizado");
    error.status = 401;
    throw error;
  }

  const normalizedUsername = validateUsername(username);
  const user = await repository.findById(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  if (user.username === normalizedUsername) {
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified
    };
  }

  const usernameReserved = await repository.findByUsername(normalizedUsername);
  if (usernameReserved && usernameReserved._id.toString() !== user._id.toString()) {
    throwBadRequest("El username ya esta en uso");
  }

  user.username = normalizedUsername;

  try {
    await user.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throwBadRequest("El username ya esta en uso");
    }

    throw error;
  }

  await publishUsernameUpdated({
    authId: user._id.toString(),
    username: user.username
  });

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    emailVerified: user.emailVerified
  };
};

const resendVerificationEmail = async ({ email }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throwBadRequest("email es obligatorio");
  }

  const user = await repository.findByEmail(normalizedEmail);

  if (!user || user.emailVerified) {
    return { verificationEmailSent: false };
  }

  const verification = buildVerificationData();

  user.emailVerificationToken = verification.hashedCode;
  user.emailVerificationExpires = verification.expires;
  await user.save();

  const mailResult = await sendVerificationEmail({
    email: user.email,
    code: verification.code
  });

  return {
    verificationEmailSent: mailResult.sent
  };
};

const forgotPassword = async ({ email }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throwBadRequest("email es obligatorio");
  }

  const user = await repository.findByEmail(normalizedEmail);

  if (!user) {
    return { passwordResetEmailSent: false };
  }

  const code = createNumericCode();

  user.passwordResetToken = hashToken(code);
  user.passwordResetExpires = addMinutes(15);
  await user.save();

  const mailResult = await sendPasswordResetEmail({
    email: user.email,
    code
  });

  return {
    passwordResetEmailSent: mailResult.sent
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throwBadRequest("codigo y password son obligatorios");
  }

  if (password.length < 6) {
    throwBadRequest("La contrasena debe tener al menos 6 caracteres");
  }

  const user = await repository.findByPasswordResetToken(hashToken(token));

  if (!user) {
    const error = new Error("Codigo de recuperacion invalido o expirado");
    error.status = 400;
    throw error;
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    id: user._id,
    email: user.email
  };
};

const changePassword = async ({ authId, currentPassword, newPassword }) => {
  if (!authId) {
    const error = new Error("No autorizado");
    error.status = 401;
    throw error;
  }

  if (!currentPassword || !newPassword) {
    throwBadRequest("currentPassword y newPassword son obligatorios");
  }

  if (newPassword.length < 6) {
    throwBadRequest("La nueva contrasena debe tener al menos 6 caracteres");
  }

  const user = await repository.findById(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  const valid = await bcrypt.compare(currentPassword, user.password);

  if (!valid) {
    const error = new Error("La contrasena actual es incorrecta");
    error.status = 401;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    id: user._id,
    email: user.email
  };
};

const getAccountStatus = async (authId) => {
  if (!authId) {
    throwBadRequest("authId es obligatorio");
  }

  const user = await repository.findById(authId);

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return buildAccountStatusResponse(user);
};

const suspendUser = async ({ authId, suspendedUntil, reason, adminAuthId }) => {
  if (!authId) {
    throwBadRequest("authId es obligatorio");
  }

  const until = new Date(suspendedUntil);

  if (!suspendedUntil || Number.isNaN(until.getTime()) || until <= new Date()) {
    throwBadRequest("suspendedUntil debe ser una fecha futura valida");
  }

  const user = await repository.updateById(authId, {
    accountStatus: "SUSPENDED",
    suspendedUntil: until,
    moderationReason: reason?.trim() || null,
    moderatedAt: new Date(),
    moderatedByAuthId: adminAuthId
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return buildAccountStatusResponse(user);
};

const banUser = async ({ authId, reason, adminAuthId }) => {
  if (!authId) {
    throwBadRequest("authId es obligatorio");
  }

  const user = await repository.updateById(authId, {
    accountStatus: "BANNED",
    suspendedUntil: null,
    moderationReason: reason?.trim() || null,
    moderatedAt: new Date(),
    moderatedByAuthId: adminAuthId
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return buildAccountStatusResponse(user);
};

const unbanUser = async ({ authId, adminAuthId }) => {
  if (!authId) {
    throwBadRequest("authId es obligatorio");
  }

  const user = await repository.updateById(authId, {
    accountStatus: "ACTIVE",
    suspendedUntil: null,
    moderationReason: null,
    moderatedAt: new Date(),
    moderatedByAuthId: adminAuthId
  });

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  return buildAccountStatusResponse(user);
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUsername,
  getAccountStatus,
  suspendUser,
  banUser,
  unbanUser
};
