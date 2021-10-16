import { validationResult } from "express-validator";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

//Custom middleware

const validationMiddleware = (req, res, next) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let message = errors.errors[0].msg;
    throw new ErrorHandler(400, "validationError", 10091, message);
  }
  next();
};

export default validationMiddleware;
