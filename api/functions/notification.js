import { Notification } from "../models";

async function createNotification(body) {
  // Create a new Notification
  let updating = {};
  let responseObject = {
    code: 401,
    success: false,
    message: null,
  };

  if (body.summary && body.summary.length > 40) {
    responseObject.message =
      "Summary too long(should be less than 30 characters)";
    responseObject.success = false;
    return responseObject;
  } else {
    updating.summary = body.summary;
  }

  if (body.details && body.details.length > 500) {
    responseObject.message = "Details too long(>500 characters)";
    responseObject.success = false;
    return responseObject;
  } else {
    updating.details = body.details;
  }

  if (body.label) {
    updating.label = body.label;
  }

  if (body.sender) {
    updating.sender = body.sender;
  }

  if (body.receiver) {
    updating.receiver = body.receiver;
  }

  let notification = new Notification({
    ...updating,
  });

  let saved = await notification.save();

  if (saved) {
    responseObject.message = "Notification sent";
    responseObject.success = true;
    return responseObject;
  } else {
    responseObject.message = "Notification could not be sent";
    responseObject.success = false;
    return responseObject;
  }
}

export default createNotification;
