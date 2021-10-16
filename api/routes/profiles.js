import { Router } from "express";
import { userAuth} from "../middlewares/auth-guard";
import { validateAdmin } from "../middlewares/admin-guard";
const ProfilesController = require("../controllers/profiles");

const router = Router();


/**
 * @description To Get the authenticated user's profile
 * @api /profiles/my-profile
 * @access Private
 * @type GET
 */
 router.get("/", validateAdmin, ProfilesController.getAllProfiles);

/**
 * @description To Get the authenticated user's profile
 * @api /profiles/my-profile
 * @access Private
 * @type GET
 */
router.get("/my-profile", userAuth, ProfilesController.myProfile);

/**
 * @description To update autheticated user's profile
 * @type PUT <multipart-form> request
 * @api /profiles/update-profile
 * @access Private
 */
router.put("/update-profile", userAuth, ProfilesController.updateProfile);

/**
 * @description To get user's profile with the username
 * @api /profiles/update-profile
 * @access Public
 * @type GET
 */
router.get("/:username", userAuth, ProfilesController.getProfile);

export default router;
