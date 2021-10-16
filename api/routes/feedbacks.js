import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
import validator from "../middlewares/validator-middleware";
import { feedbackValidations } from "../validators/index.js";
const FeedbacksController = require("../controllers/feedbacks");

const router = Router();

/**
 * @description To Upload Feedback Image
 * @api /
 * @access private
 * @type Feedback
 */
router.get("/", userAuth, FeedbacksController.getAllFeedbacks);

/**
 * @description To Upload Feedback Image
 * @api /
 * @access private
 * @type Feedback
 */
router.get(
  "/user-feedbacks",
  userAuth,
  FeedbacksController.getAllUserFeedbacks
);

/**
 * @description Get Single Feedback
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", userAuth, FeedbacksController.getSingleFeedback);

/**
 * @description To Feedback on a Feedback by authenticated user
 * @api /Feedbacks/Feedback-Feedback
 * @access private
 * @type PUT
 */
router.post(
  "/feedback",
  [userAuth, feedbackValidations],
  FeedbacksController.createFeedback
);

/**
 * @description To update a Feedback by the authenticated User
 * @api /Feedbacks/update-Feedback
 * @access private
 * @type PUT
 */
router.put(
  "/respond/:id",
  [validateAdmin, feedbackValidations],
  FeedbacksController.responseFeedback
);

/**
 * @description To update a Feedback by the authenticated User
 * @api /Feedbacks/delete-Feedback/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/del-feedback/:id",
  validateAdmin,
  FeedbacksController.deleteFeedback
);

export default router;
