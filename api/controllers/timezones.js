import { Timezone } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getServerTime = async (req, res, next) => {
  try {
    let serverOffset = new Date().getTimezoneOffset();
    let response = { serverOffset: serverOffset };
    SuccessHandler(res, "success", 200, "ok", response);
  } catch (err) {
    return next(err);
  }
};

exports.getAllTimezones = async (req, res, next) => {
  try {
    Timezone.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          timezones: docs.map((doc) => {
            return {
              value: doc.value,
              offset: doc.offset,
              abbr: doc.abbr,
              isdst: doc.isdst,
              text: doc.text,
              utc: doc.utc,
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

exports.getSingleTimezone = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleTimezone", 16001, "Malformed ID");
    }

    let timezone = await Timezone.findOne({ _id: id });

    if (!timezone) {
      throw new ErrorHandler(
        404,
        "getSingleTimezone",
        16002,
        "Timezone with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", timezone);
  } catch (err) {
    return next(err);
  }
};

exports.createTimezone = async (req, res, next) => {
  try {
    // Create a new Timezone
    let { body, user } = req;
    let value = body.value;
    let offset = body.offset;
    let abbr = body.abbr;
    let isdst = body.isdst;
    let text = body.text;
    let utc = body.utc;

    if (!value || !offset || !abbr || !isdst || !text || !utc) {
      throw new ErrorHandler(
        400,
        "createTimezone",
        16003,
        "Missing required fields"
      );
    }

    //check for duplicate name;
    let offsetFound = await Timezone.findOne({ offset });
    if (offsetFound) {
      throw new ErrorHandler(
        400,
        "createTimezone",
        16004,
        "Offset already exists"
      );
    }

    let timezone = new Timezone({
      ...body,
    });

    await Timezone.save();

    SuccessHandler(res, "success", 201, "ok", timezone._id);
  } catch (err) {
    return next(err);
  }
};

exports.updateTimezone = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { body, user } = req;
    let updating = {};

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "updateTimezone", 16005, "Malformed ID");
    }

    if (body.offset) {
      let offset = body.offset;
      let timezoneFound = await Timezone.findOne({
        offset,
        _id: { $nin: id },
      });
      if (timezoneFound) {
        throw new ErrorHandler(
          400,
          "updateTimezone",
          16006,
          "Timezone with offset already exists"
        );
      }

      updating.offset = body.offset;
    }

    if (body.value) {
      updating.value = body.value;
    }

    if (body.abbr) {
      updating.abbr = body.abbr;
    }

    if (body.isdst) {
      updating.isdst = body.isdst;
    }

    if (body.text) {
      updating.text = body.text;
    }

    if (body.utc) {
      updating.utc = body.utc;
    }

    let timezone = await Timezone.findOneAndUpdate(
      { _id: id },
      {
        ...updating,
        user: user._id,
      },
      { new: true }
    );

    if (!timezone) {
      throw new ErrorHandler(
        404,
        "updateTimezone",
        16007,
        "Timezone not found"
      );
    }

    SuccessHandler(res, "success", 201, "ok", timezone._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteTimezone = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteTimezone", 16008, "Malformed ID");
    }

    // Chcek if the Timezone with the id is in the database or not?
    let timezone = await Timezone.findById(id);
    if (!timezone) {
      throw new ErrorHandler(
        404,
        "deleteTimezone",
        16009,
        "Timezone with id not found"
      );
    }

    await Timezone.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
