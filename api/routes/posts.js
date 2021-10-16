import { Router } from "express";
import { userAuth} from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
import validator from "../middlewares/validator-middleware";
import { postValidations, imageValidations } from "../validators";
const PostsController = require("../controllers/posts");

const router = Router();

/**
 * @description To Upload Post Image
 * @api /
 * @access private
 * @type POST
 */
router.get("/", userAuth, PostsController.getAllPosts);

/**
 * @description Get Single Post
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", userAuth, PostsController.getSinglePost);

/**
 * @description To create a new post by the authenticated User
 * @api /posts/create-post
 * @access private
 * @type POST
 */
router.post(
  "/create-post",
  [userAuth, postValidations, validator],
  PostsController.createPost
);

/**
 * @description To update a post by the authenticated User
 * @api /posts/upadte-post
 * @access private
 * @type PUT
 */
router.put(
  "/update-post/:id",
  userAuth,
  postValidations,
  validator,
  PostsController.updatePost
);

/**
 * @description To update a post by the authenticated User
 * @api /delete-post/:id
 * @access private
 * @type PUT
 */
router.delete("/delete-post/:id", userAuth, PostsController.deletePost);

/**
 * @description To like a post by authenticated user
 * @api /posts/like-post
 * @access private
 * @type PUT
 */
router.put("/like-post/:id", userAuth, PostsController.likePost);

/**
 * @description To like a post by authenticated user
 * @api /posts/dislike-post
 * @access private
 * @type PUT
 */
router.put("/unlike-post/:id", userAuth, PostsController.unLikePost);

/**
 * @description To mark a post as favorite by authenticated user
 * @api /posts/favorite-post
 * @access private
 * @type PUT
 */
router.put("/favorite-post/:id", userAuth, PostsController.favoritePost);

/**
 * @description To unmark a post as favorite by authenticated user
 * @api /posts/unfavorite-post
 * @access private
 * @type PUT
 */
router.put("/unfavorite-post/:id", userAuth, PostsController.unFavoritePost);

/**
 * @description Process Post
 * @api /:id
 * @access private
 * @type PUT
 */
router.put(
  "/process/:id",
  [userAuth, validateAdmin],
  PostsController.processPost
);

export default router;
