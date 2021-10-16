import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
import validator from "../middlewares/validator-middleware";
import { categoryValidations, imageValidations } from "../validators";
const CategoriesController = require("../controllers/categories");

const router = Router();

/**
 * @description Get all categories
 * @api /
 * @access private
 * @type POST
 */
router.get("/", CategoriesController.getAllCategories);

/**
 * @description Get Single Category
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", CategoriesController.getSingleCategory);

/**
 * @description To create a new category by the authenticated User
 * @api /categories/create-category
 * @access private
 * @type POST
 */
router.post(
  "/create-category",
  [validateAdmin, categoryValidations, imageValidations, validator],
  CategoriesController.createCategory
);

/**
 * @description To update a category by the authenticated User
 * @api /categories/upadte-category
 * @access private
 * @type PUT
 */
router.put(
  "/update-category/:id",
  [validateAdmin, categoryValidations, validator],
  CategoriesController.updateCategory
);

/**
 * @description To delete a category by the authenticated User
 * @api /delete-category/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/delete-category/:id",
  [validateAdmin],
  CategoriesController.deleteCategory
);

/**
 * @description To follow a category by authenticated user
 * @api /categories/follow-category
 * @access private
 * @type PUT
 */
router.put(
  "/follow-category/:id",
  userAuth,
  CategoriesController.followCategory
);

/**
 * @description To like a category by authenticated user
 * @api /categories/unfollow-category
 * @access private
 * @type PUT
 */
router.put(
  "/unfollow-category/:id",
  userAuth,
  CategoriesController.unfollowCategory
);

export default router;
