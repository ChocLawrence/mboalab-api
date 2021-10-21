import { API_DOMAIN, DOMAIN } from "../constants";
import { Email, User } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.pingServer = async (req, res, next) => {
  try {
    SuccessHandler(res, "success", 200, "ok", "Mboalab Server alive");
  } catch (err) {
    return next(err);
  }
};
