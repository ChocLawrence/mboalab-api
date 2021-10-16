import { Router } from "express";
import { updatePasswordValidations } from "../validators";
import validator from "../middlewares/validator-middleware";
import { userAuth } from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
const UsersController = require("../controllers/users");

const router = Router();

/**
 * @description To Get all Users
 * @api /
 * @access private
 * @type POST
 */
router.get("/", validateAdmin, UsersController.getAllUsers);

/**
 * @description To initiate the password reset process
 * @api /users/up-pass
 * @access Public
 * @type PUT
 */
router.put(
  "/up-pass",
  [userAuth, updatePasswordValidations, validator],
  UsersController.updatePassword
);

/**
 * @description Update User
 * @api /:id
 * @access private
 * @type PUT
 */
router.put("/:id", userAuth, UsersController.updateUser);

/**
 * @description Get User
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", userAuth, UsersController.getSingleUser);

/**
 * @description Ban User
 * @api /:id
 * @access private
 * @type PUT
 */
router.put("/ban/:id", validateAdmin, UsersController.banUser);

/**
 * @description UnBan User
 * @api /:id
 * @access private
 * @type PUT
 */
router.put("/activate/:id", validateAdmin, UsersController.activateUser);

/**
 * @description Delete User Request
 * @api /:id
 * @access private
 * @type PUT
 */
router.put("/user-del-request", userAuth, UsersController.deleteUserRequest);

/**
 * @description Delete User
 * @api /:id
 * @access private
 * @type DELETE
 */
router.delete("/:id", validateAdmin, UsersController.deleteUser);

export default router;
