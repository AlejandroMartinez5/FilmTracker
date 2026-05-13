const notificationsService = require("../services/notifications.service");

const createNotification = async (req, res) => {
  try {
    const notification = await notificationsService.createNotification({
      ...req.body,
      actorAuthId: req.body.actorAuthId || req.user.authId
    });

    return res.status(201).json({
      message: "Notificacion creada correctamente",
      data: notification
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const result = await notificationsService.getNotifications(
      req.user.authId,
      req.query
    );

    return res.status(200).json({
      message: "Notificaciones obtenidas correctamente",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user.authId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await notificationsService.markAsRead(
      req.user.authId,
      req.params.notificationId
    );

    return res.status(200).json({
      message: "Notificacion marcada como leida",
      data: notification
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.authId);

    return res.status(200).json({
      message: "Notificaciones marcadas como leidas",
      data: result.notifications,
      updated: result.updated
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await notificationsService.deleteNotification(
      req.user.authId,
      req.params.notificationId
    );

    return res.status(200).json({
      message: "Notificacion eliminada correctamente"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
