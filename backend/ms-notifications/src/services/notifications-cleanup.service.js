const notificationsRepository = require("../repositories/notifications.repository");

const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_CLEANUP_INTERVAL_HOURS = 24;

const getPositiveNumber = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const getRetentionDays = () => {
  return Math.floor(
    getPositiveNumber(
      process.env.NOTIFICATIONS_RETENTION_DAYS,
      DEFAULT_RETENTION_DAYS
    )
  );
};

const getCleanupIntervalMs = () => {
  const hours = getPositiveNumber(
    process.env.NOTIFICATIONS_CLEANUP_INTERVAL_HOURS,
    DEFAULT_CLEANUP_INTERVAL_HOURS
  );

  return hours * 60 * 60 * 1000;
};

const cleanupExpiredNotifications = async () => {
  const retentionDays = getRetentionDays();
  const deletedCount = await notificationsRepository.deleteOlderThanDays(
    retentionDays
  );

  if (deletedCount > 0) {
    console.log(
      `[ms-notifications] ${deletedCount} notificaciones antiguas eliminadas`
    );
  }

  return {
    deletedCount,
    retentionDays
  };
};

const startNotificationsCleanupJob = () => {
  const intervalMs = getCleanupIntervalMs();

  cleanupExpiredNotifications().catch((error) => {
    console.error(
      "[ms-notifications] Error limpiando notificaciones antiguas:",
      error.message
    );
  });

  const interval = setInterval(() => {
    cleanupExpiredNotifications().catch((error) => {
      console.error(
        "[ms-notifications] Error limpiando notificaciones antiguas:",
        error.message
      );
    });
  }, intervalMs);

  interval.unref?.();

  console.log(
    `[ms-notifications] Limpieza de notificaciones programada cada ${Math.round(
      intervalMs / (60 * 60 * 1000)
    )}h; retencion: ${getRetentionDays()} dias`
  );
};

module.exports = {
  cleanupExpiredNotifications,
  startNotificationsCleanupJob
};
