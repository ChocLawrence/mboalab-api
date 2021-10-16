import { Notification } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllNotifications = async (req, res, next) => {
  try {
    Notification.find({ receiver: req.user._id, deleted: false })
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          notifications: docs.map((doc) => {
            return {
              summary: doc.summary,
              details: doc.details,
              read: doc.read,
              label: doc.label,
              sender: doc.sender,
              receiver: doc.receiver,
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

exports.getSingleNotification = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(
        404,
        "getSingleNotification",
        11001,
        "Malformed ID"
      );
    }

    let notification = await Notification.findById(id);

    if (!notification) {
      throw new ErrorHandler(
        404,
        "getSingleNotification",
        11002,
        "Notification with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", notification);
  } catch (err) {
    return next(err);
  }
};

exports.markAsReadNotification = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(
        404,
        "markAsReadNotification",
        11003,
        "Malformed ID"
      );
    }

    let notificationFound = await Notification.findById(id);
    if (!notificationFound) {
      throw new ErrorHandler(
        404,
        "markAsReadNotification",
        11004,
        "Notification with id not found"
      );
    }

    if (notificationFound.receiver.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(
        403,
        "markAsReadNotification",
        11005,
        "Unauthorized action"
      );
    }

    let notification = await Notification.findOneAndUpdate(
      { _id: id },
      {
        read: true,
      },
      { new: true }
    );

    if (!notification) {
      throw new ErrorHandler(
        404,
        "markAsReadNotification",
        11006,
        "Notification could not be updated"
      );
    }

    SuccessHandler(res, "success", 201, "ok", notification._id);
  } catch (err) {
    return next(err);
  }
};

exports.markAsUnReadNotification = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11007,
        "Malformed ID"
      );
    }

    let notificationFound = await Notification.findById(id);
    if (!notificationFound) {
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11008,
        "Notification with id not found"
      );
    }

    if (notificationFound.receiver.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(
        403,
        "markAsUnReadNotification",
        11009,
        "Unauthorized action"
      );
    }

    let notification = await Notification.findOneAndUpdate(
      { _id: id },
      {
        read: false,
      },
      { new: true }
    );

    if (!notification) {
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11010,
        "Notification could not be updated"
      );
    }

    SuccessHandler(res, "success", 201, "ok", notification._id);
  } catch (err) {
    return next(err);
  }
};

exports.markAsDeletedNotification = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11011,
        "Malformed ID"
      );
    }

    let notificationFound = await Notification.findById(id);
    if (!notificationFound) {
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11012,
        "Notification with id not found"
      );
    }

    if (notificationFound.receiver.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(
        403,
        "markAsUnReadNotification",
        11013,
        "Unauthorized action"
      );
    }

    let notification = await Notification.findOneAndUpdate(
      { _id: id },
      {
        deleted: true,
      },
      { new: true }
    );

    if (!notification) {
      throw new ErrorHandler(
        404,
        "markAsUnReadNotification",
        11014,
        "Notification could not be updated"
      );
    }

    SuccessHandler(res, "success", 201, "ok", notification._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteNotification", 11015, "Malformed ID");
    }

    // Chcek if the Notification with the id is in the database or not?
    let notification = await Notification.findById(id);
    if (!notification) {
      throw new ErrorHandler(
        404,
        "deleteNotification",
        11016,
        "Notification with id not found"
      );
    }

    if (notification.receiver.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(403, "deleteNotification", 11017, "Unauthorized");
    }

    await notification.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
