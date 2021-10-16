import { DOMAIN } from "../constants";
import { User } from "../models";
const { ejs, path } = require("../config");
import sendMail from "../functions/email-sender";
import createNotification from "../functions/notification";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllUsers = async (req, res, next) => {
  try {
    User.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          users: docs.map((doc) => {
            return {
              firstname: doc.firstname,
              lastname: doc.lastname,
              username: doc.username,
              status: doc.status,
              gender: doc.gender,
              profile: doc.profile,
              verified: doc.verified,
              loggedin: doc.loggedin,
              role: doc.role,
              email: doc.email,
              createdat: doc.createdAt,
              updatedat: doc.updatedAt,
              _id: doc._id,
            };
          }),
        };

        SuccessHandler(res, "success", 200, "ok", response);
      });
  } catch (err) {
    return next(err);
  }
};

exports.getSingleUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleUser", 17001, "Malformed ID");
    }

    let user = await User.findOne({ _id: id }).select([
      "-resetPasswordToken",
      "-resetPasswordExpiresIn",
      "-password",
    ]);

    if (!user) {
      throw new ErrorHandler(
        404,
        "getSingleUser",
        17002,
        "User with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", user);
  } catch (err) {
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { body } = req;
    let updating = {};

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "updateUser", 17003, "Malformed ID");
    }

    if (!body.username && !body.firstname && !body.lastname) {
      throw new ErrorHandler(
        400,
        "updateUser",
        17004,
        "Only basic data allowed"
      );
    }

    let usr = await User.findById(id);
    if (!usr) {
      throw new ErrorHandler(
        404,
        "updateUser",
        17005,
        "User with id not found"
      );
    }

    if (id.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(
        401,
        "updateUser",
        17006,
        "Account doesn't belong to you.Logout and in.."
      );
    }

    if (body.username) {
      let username = body.username;

      let usernameFound = await User.findOne({ username, _id: { $nin: id } });
      if (usernameFound) {
        throw new ErrorHandler(
          404,
          "updateUser",
          17007,
          "Username is already taken."
        );
      } else {
        updating.username = body.username;
      }
    }

    if (body.firstname) updating.firstname = body.firstname;
    if (body.lastname) updating.lastname = body.lastname;

    let user = await User.findOneAndUpdate(
      { _id: id },
      { ...updating },
      {
        new: true,
      }
    );

    if (!user) {
      throw new ErrorHandler(404, "updateUser", 17008, "User not found");
    }

    SuccessHandler(res, "success", 201, "ok", user._id);
  } catch (err) {
    return next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    let { body } = req;
    let oldpassword = body.oldpassword;
    let password = body.password;

    let user = await User.findById({ _id: req.user._id });

    if (!user) {
      throw new ErrorHandler(
        404,
        "updatePassword",
        17009,
        "User with id not found"
      );
    }

    //check if old password matches current system password
    if (!(await user.comparePassword(oldpassword))) {
      throw new ErrorHandler(404, "updatePassword", "Invalid old password");
    }

    if (oldpassword == password) {
      throw new ErrorHandler(
        404,
        "updatePassword",
        17010,
        "Old and new password thesame"
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
        title: "Password Changed Success| ChocInspired",
        imageUrl:
          "https://drive.google.com/uc?id=1wg3mt4rtzVz4Xlb4DDKYXQSESD3Zia2q",
        mode: "resetPasswordSuccess",
        imageText: "Password reset success",
        stageOneText:
          "Your password was changed successfully. Keep using ChocInspired.",
        stageOneButtonText: "Go to Site",
        stageTwoText:
          "If this change was not done by you then you can reset your password now.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Password changed Successfully", emailTemplate);

    //send notification
    let data = {
      receiver: user._id,
      sender: "ChocInspired",
      summary: "Password Changed",
      details: "Your password was changed successfully. Keep using ChocInspired.",
    };
    await createNotification(data);

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "banUser", 17011, "Malformed ID");
    }

    // Check if the post with the id is in the database or not?
    let user = await User.findById(id);

    if (!user) {
      throw new ErrorHandler(404, "banUser", 17012, "User not found");
    }

    if (req.user.role !== "admin") {
      throw new ErrorHandler(401, "banUser", 17013, "Not authorized");
    }

    //send ban email

    user = await User.findOneAndUpdate(
      { _id: id },
      {
        status: "banned",
        loggedin: 0,
      },
      { new: true }
    );

    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Banned | ChocInspired",
        imageUrl:
          "https://drive.google.com/uc?id=1wg3mt4rtzVz4Xlb4DDKYXQSESD3Zia2q",
        mode: "main",
        imageText: "Account banned",
        stageOneText:
          "ChocInspired noticed suspicious activity on your account. The account has been shutdown. Contact us immediately to verify a couple of details. Your security is our priority and we want to keep you as well as other users safe.",
        stageOneButtonText: "Go to Site",
        stageTwoText: "Kindly reach out to us through this mail.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Account Banned", emailTemplate);

    SuccessHandler(res, "success", 201, "ok", user._id);
  } catch (err) {
    return next(err);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "banUser", 17014, "Malformed ID");
    }

    // Check if the post with the id is in the database or not?
    let user = await User.findById(id);

    if (!user) {
      throw new ErrorHandler(404, "unBanUser", 17015, "User not found");
    }

    if (req.user.role !== "admin") {
      throw new ErrorHandler(401, "unBanUser", 17016, "Not authorized");
    }

    user = await User.findOneAndUpdate(
      { _id: id },
      {
        status: "active",
      },
      { new: true }
    );

    //send email to user.
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Account Activated | ChocInspired",
        imageUrl:
          "https://drive.google.com/uc?id=1wg3mt4rtzVz4Xlb4DDKYXQSESD3Zia2q",
        mode: "main",
        imageText: "Account has been activated",
        stageOneText:
          "Your account has been successfully activated. You now access to ChocInspired and all its services. We are glad to have you back on board.",
        stageOneButtonText: "Go to Site",
        stageTwoText: "Kindly reach out to us if anything, through this mail.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Account activated", emailTemplate);

    SuccessHandler(res, "success", 201, "ok", user._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteUserRequest = async (req, res, next) => {
  try {
    let { user } = req;

    if (!user._id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteUserRequest", 17017, "Malformed ID");
    }

    // Check if the post with the id is in the database or not?
    let userFound = await User.findById(user._id);

    if (!userFound) {
      throw new ErrorHandler(404, "deleteUserRequest", 17018, "User not found");
    }

    if (req.user.role === "admin") {
      throw new ErrorHandler(401, "deleteUserRequest", 17019, "Not authorized");
    }

    //send ban email

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        status: "inactive",
      },
      { new: true }
    );

    //send email to user.
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Account Deactivated | ChocInspired",
        imageUrl:
          "https://drive.google.com/uc?id=1wg3mt4rtzVz4Xlb4DDKYXQSESD3Zia2q",
        mode: "main",
        imageText: "Account deactivated",
        stageOneText:
          "Your account has been successfully deactivated. If no action from you is recorded within three days, the account will be deleted.",
        stageOneButtonText: "Go to Site",
        stageTwoText: "Kindly reach out to us if anything, through this mail.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Account deactivated", emailTemplate);

    SuccessHandler(res, "success", 201, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteUser", 17020, "Malformed ID");
    }

    // Check if the post with the id is in the database or not?
    let user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      throw new ErrorHandler(404, "deleteUser", 17021, "No such user");
    }

    //send email to user.
    const emailTemplate = await ejs.renderFile(
      path.join(__dirname, "../templates/emailTemplate.ejs"),
      {
        user: `${user.username}`,
        email: `${user.email}`,
        title: "Account Shutdown | ChocInspired",
        imageUrl:
          "https://drive.google.com/uc?id=1wg3mt4rtzVz4Xlb4DDKYXQSESD3Zia2q",
        mode: "main",
        imageText: "Account has been shutdown",
        stageOneText:
          "We are sad to see you go.Your account has been shutdown on ChocInspired. We would like to know more about your reasons for wanting to leave if you don't mind.Kindly reply this mail with your worries.",
        stageOneButtonText: "Go to Site",
        stageTwoText:
          "If this request was not made by you, contact us immediately through this mail.",
        url: `${DOMAIN}`,
      }
    );
    await sendMail(user.email, "Account Shutdown", emailTemplate);

    // //delete posts of user
    // await Post.deleteMany({
    //   author: id,
    // });

    // //delete comments of user
    // await Comment.deleteMany({
    //   user: id,
    // });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (error) {
    return next(error);
  }
};
