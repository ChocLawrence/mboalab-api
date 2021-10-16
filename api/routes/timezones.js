import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
import { validateAdmin } from "../middlewares/admin-guard";
import { timezoneValidations } from "../validators/index.js";
const TimezonesController = require("../controllers/timezones");

const router = Router();

/**
 * @description Get all Timezones
 * @api /
 * @access private
 * @type POST
 */
router.get("/", TimezonesController.getAllTimezones);

/**
 * @description ping from timezone
 * @api /ping
 * @access private
 * @type POST
 */
router.get("/ping", TimezonesController.getServerTime);

/**
 * @description Get Single timezone
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", [userAuth], TimezonesController.getSingleTimezone);

/**
 * @description To create a new timezone by the authenticated User
 * @api /timezones/create-timezone
 * @access private
 * @type POST
 */
router.post(
  "/timezone",
  [validateAdmin, timezoneValidations, validator],
  TimezonesController.createTimezone
);

/**
 * @description To update a timezone by the authenticated User
 * @api /timezones/update-timezone/:id
 * @access private
 * @type PUT
 */
router.put(
  "/up-timezone/:id",
  validateAdmin,
  TimezonesController.updateTimezone
);

/**
 * @description To delete a timezone by the authenticated User
 * @api /delete-timezone/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/del-timezone/:id",
  validateAdmin,
  TimezonesController.deleteTimezone
);

export default router;
