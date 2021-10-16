import { ejs, path } from "../config";
import { User, Email, Profile } from "../models";
import { randomBytes } from "crypto";
import { API_DOMAIN, DOMAIN } from "../constants";
import { validEmail } from "../functions/generic";
import sendMail from "../functions/email-sender";
import createNotification from "../functions/notification";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";
import { isLength } from "lodash";

exports.signUp = async (req, res, next) => {
  try {
    let { username, email } = req.body;

    if (
      !req.body.username &&
      !req.body.firstname &&
      !req.body.lastname &&
      !req.body.gender
    ) {
      throw new ErrorHandler(400, "register", 10001, "No body parsed..");
    }

    if (
      req.body.gender != "f" &&
      req.body.gender != "m" &&
      req.body.gender != "u"
    ) {
      throw new ErrorHandler(
        400,
        "register",
        "Wrong gender Entry: 'male' or 'female' or 'undisclosed'"
      );
    }

    if (username.split(/\W+/).length > 1) {
      throw new ErrorHandler(
        404,
        "signUp",
        10002,
        "Username cannot contain spaces"
      );
    }
    // Check if the username is taken or not
    let user = await User.findOne({ username });
    if (user) {
      throw new ErrorHandler(
        400,
        "register",
        10003,
        "Username is already taken."
      );
    }

    if (!validEmail(email)) {
      throw new ErrorHandler(
        400,
        "register",
        10005,
        "Invalid email.Check and retry"
      );
    }

    // Check if the user exists with that email
    user = await User.findOne({ email });
    if (user) {
      throw new ErrorHandler(
        400,
        "register",
        10004,
        "Email is already registered. Did you forget the password. Try resetting it."
      );
    }
    user = new User({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      profile: "1",
      verificationCode: randomBytes(10).toString("hex"),
      verificationCodeExpiresIn: Date.now() + 3600000,
    });

    // Send the email to the user with a varification link

    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Verify Email | MboaLab",
        imageUrl:
          "https://drive.google.com/uc?id=1RvaW5sOIMiSMaoaI6J-EnibfT7AwRaGj",
        mode: "main",
        imageText: "Verify your email",
        stageOneText: "Please click the button below to verify your account",
        stageOneButtonText: "Verify Email",
        stageTwoText:
          "You can alternatively copy and paste the following link in your browser:",
        url: `${DOMAIN}verification/${user.verificationCode}`,
      }
    );

    await sendMail(user.email, "Verify your account on MboaLab", emailTemplate);

    await user.save();

    //create profile automatically
    let profile = new Profile({
      account: user._id,
    });

    await profile.save().then((result) => {
      Profile.populate("account", "name email username");
    });

    //send notification
    let data = {
      receiver: user._id,
      sender: "MboaLab",
      summary: "Welcome to MboaLab",
      details:
        "Glad to have your on board. You will be able to perform a wide array of operations with Paypal, Topup,etc. Keep using MboaLab.",
    };
    await createNotification(data);

    SuccessHandler(res, "success", 201, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    let { username, password } = req.body;
    let user;

    let isEmail = validEmail(username);

    if (isEmail) {
      let email = username.toString().trim();
      user = await User.findOne({ email });
    } else {
      //check if username
      user = await User.findOne({ username: username.toString().trim() });
    }

    if (!user) {
      throw new ErrorHandler(
        404,
        "login",
        10005,
        isEmail ? "Email not found" : "Username not found "
      );
    }
    if (!(await user.comparePassword(password))) {
      throw new ErrorHandler(404, "login", 10006, "Authentication failed.");
    }

    if (user.status == "banned") {
      throw new ErrorHandler(
        401,
        "login",
        10007,
        "Contact Administrator, account has been held"
      );
    }

    if (!(await user.verified)) {
      let updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          verificationCode: randomBytes(10).toString("hex"),
          verificationCodeExpiresIn: Date.now() + 3600000,
        },
        {
          new: true,
        }
      );

      const emailTemplate = await ejs.renderFile(
        path.join(__dirname, "../templates/emailTemplate.ejs"),
        {
          user: `${updatedUser.username}`,
          email: `${updatedUser.email}`,
          title: "Verify Email | MboaLab",
          imageUrl:
            "https://drive.google.com/uc?id=1RvaW5sOIMiSMaoaI6J-EnibfT7AwRaGj",
          mode: "main",
          imageText: "Verify your email",
          stageOneText: "Please click the button below to verify your account",
          stageOneButtonText: "Verify Email",
          stageTwoText:
            "You can alternatively copy and paste the following link in your browser:",
          url: `${DOMAIN}verification/${updatedUser.verificationCode}`,
        }
      );

      await sendMail(
        updatedUser.email,
        "Verify your account on MboaLab",
        emailTemplate
      );

      throw new ErrorHandler(
        401,
        "login",
        10008,
        "Verify email first.Check your mail for code."
      );
    }
    let token = await user.generateJWT();
    let data = {
      user: user.getUserInfo(),
      token: token,
    };

    await User.findOneAndUpdate(
      { _id: user._id },
      { loggedin: 1 },
      {
        new: true,
      }
    );
    SuccessHandler(res, "success", 200, "ok", data);
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    let { user } = req;

    // const authHeader = req.headers["authorization"];
    // let logout = await jwt.sign(authHeader, "", { expiresIn: 1 });

    let usr = await User.findOneAndUpdate(
      { _id: user._id },
      { loggedin: 0 },
      {
        new: true,
      }
    );

    if (!usr) {
      throw new ErrorHandler(404, "logout", 10009, "User not found");
    }

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    let { verificationCode } = req.params;

    let user = await User.findOne({
      verificationCode,
      verificationCodeExpiresIn: { $gt: Date.now() },
    });

    if (!user) {
      throw new ErrorHandler(401, "verify", 10010, "Could not verify token.");
    }

    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresIn = undefined;

    await user.save();

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email) {
      throw new ErrorHandler(404, "resetPassword", 10011, "Missing email");
    }

    let user = await User.findOne({ email });
    if (!user) {
      throw new ErrorHandler(
        404,
        "resetPassword",
        10012,
        "User with the email is not found."
      );
    }
    user.generatePasswordReset();
    await user.save();
    // Sent the password reset Link in the email.
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Reset Password | MboaLab",
        imageUrl:
          "https://drive.google.com/uc?id=1k7RpQHhC3pFJSRIvrPFWYnsVZzkIx0pv",
        mode: "main",
        imageText: "Reset your password",
        stageOneText:
          "Please click the button below to reset your password.If this password reset request is not created by you, ignore this email",
        stageOneButtonText: "Reset Password",
        stageTwoText:
          "You can alternatively copy and paste the following link in your browser:",
        url: `${DOMAIN}password-reset/change/${user.resetPasswordToken}`,
      }
    );

    await sendMail(user.email, "Reset Password | MboaLab", emailTemplate);

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.verifyPasswordToken = async (req, res, next) => {
  try {
    let { resetPasswordToken } = req.params;

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      throw new ErrorHandler(
        403,
        "verifyPasswordToken",
        10013,
        "Redirecting to login page.."
      );
    }

    SuccessHandler(res, "success", 200, "ok", true);
  } catch (err) {
    return next(err);
  }
};

exports.resetPasswordNow = async (req, res, next) => {
  try {
    let { resetPasswordToken, password } = req.body;
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiresIn: { $gt: Date.now() },
    });
    if (!user) {
      throw new ErrorHandler(
        404,
        "resetPasswordNow",
        10014,
        "Reset request not found"
      );
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresIn = undefined;
    await user.save();
    // Send notification email about the password reset successfull process
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Password Reset Success| MboaLab",
        imageUrl:
          "https://drive.google.com/uc?id=1k7RpQHhC3pFJSRIvrPFWYnsVZzkIx0pv",
        mode: "main",
        imageText: "Password reset success",
        stageOneText:
          "Your password was resetted successfully. Keep using MboaLab.",
        stageOneButtonText: "Go to Site",
        stageTwoText:
          "If this reset is not done by you then you can contact our team.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Reset Password Successful", emailTemplate);

    //send notification
    let data = {
      receiver: user._id,
      sender: "MboaLab",
      summary: "Password Reset successful",
      details:
        "Your password reset was successful. If the request wasn't made by you, kindly contact us immediately on info@MboaLab.org",
    };
    await createNotification(data);

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};
