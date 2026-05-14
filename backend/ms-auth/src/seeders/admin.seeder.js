const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Auth = require("../models/auth.model");

const ADMIN_SEED_ENABLED = process.env.ADMIN_SEED_ENABLED === "true";
const DEFAULT_ADMIN_AUTH_ID =
  process.env.DEFAULT_ADMIN_AUTH_ID || "000000000000000000000001";
const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@reeltrack.local";
const DEFAULT_ADMIN_USERNAME =
  process.env.DEFAULT_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

const seedDefaultAdmin = async () => {
  if (!ADMIN_SEED_ENABLED) {
    return null;
  }

  const normalizedEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
  const normalizedUsername = DEFAULT_ADMIN_USERNAME.trim().toLowerCase();

  if (!normalizedEmail || !normalizedUsername || !DEFAULT_ADMIN_PASSWORD) {
    throw new Error(
      "DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_USERNAME y DEFAULT_ADMIN_PASSWORD son obligatorios para plantar el admin"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(DEFAULT_ADMIN_AUTH_ID)) {
    throw new Error("DEFAULT_ADMIN_AUTH_ID debe ser un ObjectId valido");
  }

  const adminObjectId = new mongoose.Types.ObjectId(DEFAULT_ADMIN_AUTH_ID);

  const existingAdmin = await Auth.findOne({
    $or: [
      { _id: adminObjectId },
      { email: normalizedEmail },
      { username: normalizedUsername }
    ]
  });

  if (existingAdmin) {
    const updates = {};

    if (existingAdmin.role !== "ADMIN") {
      updates.role = "ADMIN";
    }

    if (!existingAdmin.emailVerified) {
      updates.emailVerified = true;
      updates.emailVerificationToken = null;
      updates.emailVerificationExpires = null;
    }

    if (Object.keys(updates).length > 0) {
      await Auth.updateOne({ _id: existingAdmin._id }, updates);
      console.log("[ms-auth] Usuario admin existente actualizado");
    } else {
      console.log("[ms-auth] Usuario admin ya existe");
    }

    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  const admin = await Auth.create({
    _id: adminObjectId,
    email: normalizedEmail,
    username: normalizedUsername,
    password: hashedPassword,
    role: "ADMIN",
    accountStatus: "ACTIVE",
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null
  });

  console.log("[ms-auth] Usuario admin plantado correctamente");
  return admin;
};

module.exports = {
  seedDefaultAdmin
};
