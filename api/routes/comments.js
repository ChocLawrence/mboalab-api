import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
import { commentValidations } from "../validators";
const CommentsController = require("../controllers/comments");

const router = Router();

/**
 * @description To Upload Post Image
 * @api /
 * @access private
 * @type POST
 */
router.get("/", userAuth, CommentsController.getAllComments);

/**
 * @description Get Single Post
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", userAuth, CommentsController.getSingleComment);

/**
 * @description To update a comment by the authenticated User
 * @api /comments/update-comment
 * @access private
 * @type PUT
 */
router.put(
  "/update-comment/:id",
  [userAuth, commentValidations, validator],
  CommentsController.updateComment
);

/**
 * @description To update a post by the authenticated User
 * @api /comments/delete-comment/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/delete-comment/:id",
  userAuth,
  CommentsController.deleteComment
);

/**
 * @description To comment on a post by authenticated user
 * @api /comments/comment-post
 * @access private
 * @type PUT
 */
router.post(
  "/comment-post/:id",
  [userAuth, commentValidations],
  CommentsController.createComment
);

export default router;
