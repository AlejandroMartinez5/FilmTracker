const Auth = require("../models/auth.model");

const findByEmail = async (email) => {
  return Auth.findOne({ email });
};

const findByUsername = async (username) => {
  return Auth.findOne({ username });
};

const findById = async (id) => {
  return Auth.findById(id);
};

const findByEmailVerificationToken = async (token) => {
  return Auth.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
};

const findByPasswordResetToken = async (token) => {
  return Auth.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
};

const createAuthUser = async (data) => {
  return Auth.create(data);
};

const updateById = async (id, data) => {
  return Auth.findByIdAndUpdate(id, data, { new: true });
};

const deleteById = async (id) => {
  return Auth.findByIdAndDelete(id);
};

const getAdminStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);

  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  const [
    totalUsers,
    newUsersToday,
    newUsersLast7Days,
    newUsersLast30Days,
    statusRows,
    roleRows,
    verificationRows
  ] = await Promise.all([
    Auth.countDocuments(),
    Auth.countDocuments({ createdAt: { $gte: startOfToday } }),
    Auth.countDocuments({ createdAt: { $gte: last7Days } }),
    Auth.countDocuments({ createdAt: { $gte: last30Days } }),
    Auth.aggregate([
      { $group: { _id: "$accountStatus", count: { $sum: 1 } } }
    ]),
    Auth.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Auth.aggregate([
      { $group: { _id: "$emailVerified", count: { $sum: 1 } } }
    ])
  ]);

  return {
    totalUsers,
    newUsers: {
      today: newUsersToday,
      last7Days: newUsersLast7Days,
      last30Days: newUsersLast30Days
    },
    byStatus: statusRows.reduce(
      (acc, row) => ({ ...acc, [row._id || "UNKNOWN"]: row.count }),
      { ACTIVE: 0, SUSPENDED: 0, BANNED: 0 }
    ),
    byRole: roleRows.reduce(
      (acc, row) => ({ ...acc, [row._id || "UNKNOWN"]: row.count }),
      { USER: 0, ADMIN: 0 }
    ),
    byEmailVerification: verificationRows.reduce(
      (acc, row) => ({
        ...acc,
        [row._id ? "verified" : "unverified"]: row.count
      }),
      { verified: 0, unverified: 0 }
    )
  };
};

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  findByEmailVerificationToken,
  findByPasswordResetToken,
  createAuthUser,
  updateById,
  deleteById,
  getAdminStats
};
