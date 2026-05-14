const notificationsRepository = require("../repositories/notifications.repository");
const {
  getPaginationParams,
  buildPaginationMeta
} = require("../utils/pagination.util");

const VALID_STATUSES = ["all", "read", "unread"];

const throwError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const validateAuthId = (authId, fieldName = "authId") => {
  const normalized = authId?.trim();

  if (!normalized) {
    throwError(`${fieldName} es obligatorio`);
  }

  return normalized;
};

const validateNotificationId = (notificationId) => {
  const parsed = Number(notificationId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throwError("El notificationId debe ser un entero mayor a 0");
  }

  return parsed;
};

const normalizeText = (value, fieldName, maxLength) => {
  const normalized = value?.trim();

  if (!normalized) {
    throwError(`${fieldName} es obligatorio`);
  }

  if (normalized.length > maxLength) {
    throwError(`${fieldName} no puede exceder ${maxLength} caracteres`);
  }

  return normalized;
};

const normalizeMetadata = (metadata) => {
  if (metadata === undefined || metadata === null) {
    return {};
  }

  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    throwError("metadata debe ser un objeto JSON");
  }

  return metadata;
};

const normalizeFilters = (query = {}) => {
  const status = query.status || "all";

  if (!VALID_STATUSES.includes(status)) {
    throwError("status debe ser all, read o unread");
  }

  return {
    status,
    type: query.type?.trim() || null
  };
};

const createNotification = async (data) => {
  const recipientAuthId = validateAuthId(data.recipientAuthId, "recipientAuthId");
  const actorAuthId = data.actorAuthId ? validateAuthId(data.actorAuthId, "actorAuthId") : null;
  const type = normalizeText(data.type, "type", 80);
  const title = normalizeText(data.title, "title", 140);
  const body = normalizeText(data.body, "body", 1000);
  const metadata = normalizeMetadata(data.metadata);

  return notificationsRepository.create({
    recipientAuthId,
    actorAuthId,
    type,
    title,
    body,
    metadata
  });
};

const getNotifications = async (authId, query) => {
  const user = validateAuthId(authId);
  const filters = normalizeFilters(query);
  const paginationParams = getPaginationParams(query);
  const total = await notificationsRepository.countByRecipient(user, filters);
  const data = await notificationsRepository.findByRecipient(
    user,
    filters,
    paginationParams
  );

  return {
    data,
    pagination: buildPaginationMeta({
      page: paginationParams.page,
      limit: paginationParams.limit,
      total
    })
  };
};

const getUnreadCount = async (authId) => {
  const user = validateAuthId(authId);
  const unreadCount = await notificationsRepository.countUnread(user);

  return {
    unreadCount
  };
};

const markAsRead = async (authId, notificationId) => {
  const user = validateAuthId(authId);
  const parsedNotificationId = validateNotificationId(notificationId);
  const notification = await notificationsRepository.markAsRead(
    parsedNotificationId,
    user
  );

  if (!notification) {
    throwError("Notificacion no encontrada", 404);
  }

  return notification;
};

const markAllAsRead = async (authId) => {
  const user = validateAuthId(authId);
  const notifications = await notificationsRepository.markAllAsRead(user);

  return {
    updated: notifications.length,
    notifications
  };
};

const deleteNotification = async (authId, notificationId) => {
  const user = validateAuthId(authId);
  const parsedNotificationId = validateNotificationId(notificationId);
  const notification = await notificationsRepository.remove(
    parsedNotificationId,
    user
  );

  if (!notification) {
    throwError("Notificacion no encontrada", 404);
  }

  return notification;
};

const createWelcomeNotification = async ({ authId, username }) => {
  const recipientAuthId = validateAuthId(authId, "authId");
  const displayName = username?.trim() || "usuario";

  return createNotification({
    recipientAuthId,
    type: "user.welcome",
    title: "Bienvenido a FilmTracker",
    body: `Hola ${displayName}, tu cuenta esta lista para comenzar a guardar series.`,
    metadata: {
      source: "user.created"
    }
  });
};

const createEmailVerifiedNotification = async ({ authId, emailVerified }) => {
  if (!emailVerified) {
    return null;
  }

  const recipientAuthId = validateAuthId(authId, "authId");

  return createNotification({
    recipientAuthId,
    type: "user.email_verified",
    title: "Correo verificado",
    body: "Tu correo fue verificado correctamente.",
    metadata: {
      source: "user.email_verified"
    }
  });
};

const createUsernameUpdatedNotification = async ({ authId, username }) => {
  const recipientAuthId = validateAuthId(authId, "authId");
  const normalizedUsername = username?.trim();

  return createNotification({
    recipientAuthId,
    type: "user.username_updated",
    title: "Username actualizado",
    body: normalizedUsername
      ? `Tu username ahora es ${normalizedUsername}.`
      : "Tu username fue actualizado correctamente.",
    metadata: {
      source: "user.username_updated",
      username: normalizedUsername || null
    }
  });
};

const createPasswordChangedNotification = async ({ authId }) => {
  const recipientAuthId = validateAuthId(authId, "authId");

  return createNotification({
    recipientAuthId,
    type: "user.password_changed",
    title: "Contrasena actualizada",
    body: "Tu contrasena fue actualizada correctamente.",
    metadata: {
      source: "user.password_changed"
    }
  });
};

const createPasswordResetNotification = async ({ authId }) => {
  const recipientAuthId = validateAuthId(authId, "authId");

  return createNotification({
    recipientAuthId,
    type: "user.password_reset",
    title: "Contrasena restablecida",
    body: "Tu contrasena fue restablecida correctamente.",
    metadata: {
      source: "user.password_reset"
    }
  });
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createWelcomeNotification,
  createEmailVerifiedNotification,
  createUsernameUpdatedNotification,
  createPasswordChangedNotification,
  createPasswordResetNotification
};
