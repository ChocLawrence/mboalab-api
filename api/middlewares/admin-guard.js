import passport from "passport";

/**
 * @DESC Passport middleware
 */

export const validateAdmin = async (req, res, next) => {
  // generate the authenticate method and pass the req/res
  passport.authenticate("jwt", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (user.role !== "admin") {
      return res.status(403).send({
        error: {
          status: "error",
          statusCode: 403,
          code: "forbiddenError",
          state:10099,
          message: "Unauthorized action",
        },
      });
    }

    req.user = user;
    next();
    return;
  })(req, res, next);
};
