import { Router } from "express";
import { userAuth } from "../middlewares/auth-guard";
import validator from "../middlewares/validator-middleware";
import { validateAdmin } from "../middlewares/admin-guard";
import { countryValidations } from "../validators/index.js";
const CountriesController = require("../controllers/countries");

const router = Router();

/**
 * @description Get all Countries
 * @api /
 * @access private
 * @type POST
 */
router.get("/", CountriesController.getAllCountries);

/**
 * @description Get Single country
 * @api /:id
 * @access private
 * @type GET
 */
router.get(
  "/:id",
  [userAuth],
  CountriesController.getSingleCountry
);

/**
 * @description To create a new country by the authenticated User
 * @api /countrys/create-country
 * @access private
 * @type POST
 */
router.post(
  "/country",
  [validateAdmin, countryValidations, validator],
  CountriesController.createCountry
);

/**
 * @description To update a country by the authenticated User
 * @api /countrys/update-country/:id
 * @access private
 * @type PUT
 */
router.put(
  "/up-country/:id",
  [userAuth, validateAdmin],
  CountriesController.updateCountry
);

/**
 * @description To delete a country by the authenticated User
 * @api /delete-country/:id
 * @access private
 * @type PUT
 */
router.delete(
  "/del-country/:id",
  [userAuth, validateAdmin],
  CountriesController.deleteCountry
);

export default router;
