import {
  ResetPassword,
  ResetPasswordNowValidations,
  RegisterValidations,
  AuthenticateValidations,
} from "../validators";
import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
const AuthController = require("../controllers/auth");

const router = Router();

/**
 * @description To create a new User Account
 * @api /auth/register
 * @access Public
 * @type POST
 */
router.post("/signup", [RegisterValidations, validator], AuthController.signUp);

/**
 * @description To authenticate an user and get auth token
 * @api /auth/login
 * @access PUBLIC
 * @type POST
 */
router.post(
  "/login",
  [AuthenticateValidations, validator],
  AuthController.login
);

/**
 * @description To authenticate an user and get auth token
 * @api /auth/logout
 * @access PUBLIC
 * @type POST
 */
router.post("/logout", userAuth, AuthController.logout);

/**
 * @description To verify a new user's account via email
 * @api /auth/verify-now/:verificationCode
 * @access PUBLIC <Only Via email>
 * @type GET
 */
router.get("/verify-now/:verificationCode", AuthController.verify);

/**
 * @description To initiate the password reset process
 * @api /auth/reset-password
 * @access Public
 * @type POST
 */
router.put(
  "/reset-password",
  [ResetPassword, validator],
  AuthController.resetPassword
);

/**
 * @description To render reset password page
 * @api /auth/reset-password/:resetPasswordToken
 * @access Restricted via email
 * @type GET
 */
router.get(
  "/verify-token/:resetPasswordToken",
  AuthController.verifyPasswordToken
);

/**
 * @description To reset the password
 * @api /auth/reset-password-now
 * @access Restricted via email
 * @type POST
 */
router.post(
  "/reset-password-now",
  [ResetPasswordNowValidations, validator],
  AuthController.resetPasswordNow
);

export default router;
