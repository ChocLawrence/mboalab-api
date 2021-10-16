import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
import { validateAdmin } from "../middlewares/admin-guard";
import { languageValidations } from "../validators/index.js";
const LanguagesController = require("../controllers/languages");

const router = Router();

/**
 * @description Get all Languages
 * @api /
 * @access private
 * @type POST
 */
router.get("/", LanguagesController.getAllLanguages);

/**
 * @description Get Single language
 * @api /:id
 * @access private
 * @type GET
 */
router.get("/:id", [userAuth], LanguagesController.getSingleLanguage);

/**
 * @description To create a new language by the authenticated User
 * @api /languages/create-language
 * @access private
 * @type POST
 */
router.post(
  "/language",
  [validateAdmin, languageValidations, validator],
  LanguagesController.createLanguage
);

/**
 * @description To update a language by the authenticated User
 * @api /languages/update-language/:id
 * @access private
 * @type PUT
 */
router.put(
  "/up-language/:id",
  [validateAdmin],
  LanguagesController.updateLanguage
);

/**
 * @description To delete a language by the authenticated User
 * @api /delete-language/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/del-language/:id",
  validateAdmin,
  LanguagesController.deleteLanguage
);

export default router;
