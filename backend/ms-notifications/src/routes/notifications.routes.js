const express = require("express");
const notificationsController = require("../controllers/notifications.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", notificationsController.getNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);
router.post("/", notificationsController.createNotification);
router.put("/read-all", notificationsController.markAllAsRead);
router.put("/:notificationId/read", notificationsController.markAsRead);
router.delete("/:notificationId", notificationsController.deleteNotification);

module.exports = router;
