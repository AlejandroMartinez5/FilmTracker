const User = require("../models/user.model");

const ADMIN_SEED_ENABLED = process.env.ADMIN_SEED_ENABLED === "true";
const DEFAULT_ADMIN_AUTH_ID =
  process.env.DEFAULT_ADMIN_AUTH_ID || "000000000000000000000001";
const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@reeltrack.local";
const DEFAULT_ADMIN_USERNAME =
  process.env.DEFAULT_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_NAME =
  process.env.DEFAULT_ADMIN_NAME || "ReelTrack Admin";

const seedDefaultAdminProfile = async () => {
  if (!ADMIN_SEED_ENABLED) {
    return null;
  }

  const normalizedAuthId = DEFAULT_ADMIN_AUTH_ID.trim();
  const normalizedEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
  const normalizedUsername = DEFAULT_ADMIN_USERNAME.trim().toLowerCase();
  const normalizedName = DEFAULT_ADMIN_NAME.trim();

  if (!normalizedAuthId || !normalizedEmail || !normalizedUsername || !normalizedName) {
    throw new Error(
      "DEFAULT_ADMIN_AUTH_ID, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_USERNAME y DEFAULT_ADMIN_NAME son obligatorios para plantar el perfil admin"
    );
  }

  const existingAdminProfile = await User.findOne({
    $or: [
      { authId: normalizedAuthId },
      { email: normalizedEmail },
      { username: normalizedUsername }
    ]
  });

  if (existingAdminProfile) {
    const updates = {};

    if (existingAdminProfile.role !== "ADMIN") {
      updates.role = "ADMIN";
    }

    if (!existingAdminProfile.isEmailVerified) {
      updates.isEmailVerified = true;
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: existingAdminProfile._id }, updates);
      console.log("[ms-users] Perfil admin existente actualizado");
    } else {
      console.log("[ms-users] Perfil admin ya existe");
    }

    return existingAdminProfile;
  }

  const adminProfile = await User.create({
    authId: normalizedAuthId,
    email: normalizedEmail,
    username: normalizedUsername,
    name: normalizedName,
    profileImage: null,
    isEmailVerified: true,
    role: "ADMIN"
  });

  console.log("[ms-users] Perfil admin plantado correctamente");
  return adminProfile;
};

module.exports = {
  seedDefaultAdminProfile
};
