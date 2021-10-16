import { DOMAIN } from "../constants";
import { Feedback, User } from "../models";
const { ejs, path } = require("../config");
import sendMail from "../functions/email-sender";
import createNotification from "../functions/notification";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllFeedbacks = async (req, res, next) => {
  try {
    Feedback.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          feedbacks: docs.map((doc) => {
            return {
              message: doc.message,
              user: doc.user,
              response: doc.response,
              response_by: doc.response_by,
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

exports.getAllUserFeedbacks = async (req, res, next) => {
  try {
    Feedback.find({
      $or: [{ user: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          feedbacks: docs.map((doc) => {
            return {
              message: doc.message,
              user: doc.user,
              response: doc.response,
              response_by: doc.response_by,
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

exports.getSingleFeedback = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleFeedback", 80001, "Malformed ID");
    }

    let feedback = await Feedback.findOne({ _id: id });

    if (!feedback) {
      throw new ErrorHandler(
        404,
        "getSingleFeedback",
        80002,
        "Feedback with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", feedback);
  } catch (err) {
    return next(err);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    // Create a new Feedback
    let { body, user } = req;
    let id = user._id;

    if (user.role === "admin") {
      throw new ErrorHandler(401, "createFeedback", 80003, "Not authorized");
    }

    let usrFound = await User.findById(id);
    if (!usrFound) {
      throw new ErrorHandler(404, "createFeedback", 80004, "Invalid sender");
    }

    let feedback = new Feedback({
      user: id,
      message: body.message,
    });

    await feedback.save();

    //send notification

    let admin = await User.findOne({ role: "admin" });

    if (admin) {
      let data = {
        receiver: admin._id,
        sender:
          usrFound.firstname +
          " " +
          usrFound.lastname +
          " ( " +
          usrFound.username +
          ")",
        summary: "Feedback from ChocInspired User",
        details: body.message,
      };
      await createNotification(data);
    }

    SuccessHandler(res, "success", 201, "ok", feedback);
  } catch (err) {
    return next(err);
  }
};

exports.responseFeedback = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user, body } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "responseFeedback", 80005, "Malformed ID");
    }

    if (!body.message) {
      throw new ErrorHandler(
        404,
        "responseFeedback",
        80006,
        "Missing parameter message"
      );
    }

    // Chcek if the post with the id is in the database or not?
    let feedbackFound = await Feedback.findById(id);

    if (!feedbackFound) {
      throw new ErrorHandler(
        404,
        "responseFeedback",
        80007,
        "Feedback not found"
      );
    }

    if (user.role !== "admin") {
      throw new ErrorHandler(401, "responseFeedback", 80008, "Not authorized");
    }

    let feedback = await Feedback.findOneAndUpdate(
      { _id: id },
      {
        response: body.message,
        response_by: user._id,
      },
      { new: true }
    );

    //send email to notify user of response
    let userFound = await User.findById(feedback.user);

    if (userFound) {
      const emailTemplate = await ejs.renderFile(
        path.join(__dirname, "../templates/emailTemplate.ejs"),
        {
          user: `${userFound.username}`,
          email: `${userFound.email}`,
          title: "Response to Feedback | ChocInspired",
          imageUrl:
            "https://drive.google.com/uc?id=1MjXgNIFdTnnuUVoDzUSi39dNXUis-tIY",
          mode: "main",
          imageText: "Glad hearing from you",
          stageOneText:
            "ChocInspired response " +
            " <br/> ---------  <br/>" +
            body.message +
            " <br/> ---------  <br/>",
          stageOneButtonText: "Go to Site",
          stageTwoText: "Continue using ChocInspired.",
          url: `${DOMAIN}`,
        }
      );
      await sendMail(userFound.email, "Response to Feedback", emailTemplate);

      let data = {
        receiver: userFound._id,
        sender: "ChocInspired",
        summary: "Feedback from Admin",
        details: body.message,
      };

      await createNotification(data);
    }

    SuccessHandler(res, "success", 201, "ok", feedback._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteFeedback = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteFeedback", 80009, "Malformed ID");
    }

    // Chcek if the post with the id is in the database or not?
    let feedback = await Feedback.findById(id);
    if (!feedback) {
      throw new ErrorHandler(
        404,
        "deleteFeedback",
        80010,
        "Feedback with id not found"
      );
    }

    if (user.role !== "admin") {
      throw new ErrorHandler(401, "deleteFeedback", 80011, "Not authorized");
    }

    await Feedback.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
