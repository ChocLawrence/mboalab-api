import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
import { validateAdmin } from "../middlewares/admin-guard";
import { notificationValidations } from "../validators";
const NotificationsController = require("../controllers/notifications");

const router = Router();

/**
 * @description Get all Modes
 * @api /
 * @access private
 * @type POST
 */
router.get("/", [userAuth], NotificationsController.getAllNotifications);

/**
 * @description Get Single notification
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", [userAuth], NotificationsController.getSingleNotification);

/**
 * @description To update a Mode by the authenticated User
 * @api /notifications/read/:id
 * @access private
 * @type PUT
 */
router.put(
  "/mark-read/:id",
  userAuth,
  NotificationsController.markAsReadNotification
);

/**
 * @description To update a Mode by the authenticated User
 * @api /notifications/mark-unread/:id
 * @access private
 * @type PUT
 */
router.put(
  "/mark-unread/:id",
  userAuth,
  NotificationsController.markAsUnReadNotification
);

/**
 * @description To update a Mode by the authenticated User
 * @api /notifications/mark-del/:id
 * @access private
 * @type PUT
 */
router.put(
  "/mark-del/:id",
  userAuth,
  NotificationsController.markAsDeletedNotification
);

/**
 * @description To delete a notification by the authenticated User
 * @api /delete-notification/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/del-notification/:id",
  validateAdmin,
  NotificationsController.deleteNotification
);

export default router;
