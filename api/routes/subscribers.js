import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
import validator from "../middlewares/validator-middleware";
import { subscriberValidations } from "../validators";
const SubscribersController = require("../controllers/subscribers");

const router = Router();

/**
 * @description Get all subscribers
 * @api /
 * @access private
 * @type POST
 */
router.get("/", [validateAdmin], SubscribersController.getAllSubscribers);

/**
 * @description Get Single Subscriber
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", [validateAdmin], SubscribersController.getSingleSubscriber);

/**
 * @description To create a new subscriber by the authenticated User
 * @api /subscribers/create-subscriber
 * @access private
 * @type POST
 */
router.post(
  "/create-subscriber",
  [userAuth, subscriberValidations, validator],
  SubscribersController.createSubscriber
);

/**
 * @description To update a subscriber by the authenticated User
 * @api /subscribers/upadte-subscriber
 * @access private
 * @type PUT
 */
router.put(
  "/update-subscriber/:id",
  [validateAdmin, subscriberValidations, validator],
  SubscribersController.updateSubscriber
);

/**
 * @description To delete a subscriber by the authenticated User
 * @api /delete-subscriber/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/delete-subscriber/:id",
  [userAuth],
  SubscribersController.deleteSubscriber
);

export default router;
