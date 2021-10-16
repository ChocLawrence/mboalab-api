import { Subscriber } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllSubscribers = async (req, res, next) => {
  try {
    Subscriber.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          subscribers: docs.map((doc) => {
            return {
              email: doc.email,
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

exports.getSingleSubscriber = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleSubscriber", 15000, "Malformed ID");
    }

    let subscriber = await Subscriber.findOne({ _id: id });

    if (!subscriber) {
      throw new ErrorHandler(
        404,
        "getSingleSubscriber",
        15001,
        "Subscriber with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", subscriber);
  } catch (err) {
    return next(err);
  }
};

exports.createSubscriber = async (req, res, next) => {
  try {
    // Create a new Subscriber
    let { body } = req;
    let email = body.email;

    //check for duplicate slug;
    let emailFound = await Subscriber.findOne({ email });
    if (emailFound) {
      throw new ErrorHandler(
        400,
        "createSubscriber",
        15002,
        "Already Subscribed"
      );
    }

    let subscriber = new Subscriber({
      ...body,
    });

    await subscriber.save();

    //send email to subscriber

    //end send mail

    SuccessHandler(res, "success", 201, "ok", subscriber);
  } catch (err) {
    return next(err);
  }
};

exports.updateSubscriber = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { body } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "updateSubscriber", 15003, "Malformed ID");
    }

    let subscriber = await Subscriber.findOneAndUpdate(
      { _id: id },
      {
        ...body,
      },
      { new: true }
    );

    if (!subscriber) {
      throw new ErrorHandler(
        404,
        "updateSubscriber",
        15004,
        "Subscriber not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", subscriber);
  } catch (err) {
    return next(err);
  }
};

exports.deleteSubscriber = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteSubscriber", 15005, "Malformed ID");
    }

    // Chcek if the subscriber with the id is in the database or not?
    let subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      throw new ErrorHandler(
        404,
        "deleteSubscriber",
        15006,
        "Subscriber with id not found"
      );
    }

    subscriber = await Subscriber.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", []);
  } catch (err) {
    return next(err);
  }
};
