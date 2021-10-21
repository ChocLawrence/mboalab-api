import { Router } from "express";
const HealthController = require("../controllers/health");

const router = Router();

/**
 * @description Ping API Server
 * @api /
 * @access private
 * @type GET
 */
router.get("/", HealthController.pingServer);

export default router;
