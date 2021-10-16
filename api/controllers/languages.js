import { Language } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllLanguages = async (req, res, next) => {
  try {
    Language.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          languages: docs.map((doc) => {
            return {
              name: doc.name,
              code: doc.code,
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

exports.getSingleLanguage = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleLanguage", 10001, "Malformed ID");
    }

    let language = await Language.findOne({ _id: id });

    if (!language) {
      throw new ErrorHandler(
        404,
        "getSingleLanguage",
        10002,
        "Language with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", language);
  } catch (err) {
    return next(err);
  }
};

exports.createLanguage = async (req, res, next) => {
  try {
    // Create a new Language
    let { body, user } = req;
    let code = body.code;
    let name = body.name;

    if (!body.name && !body.code) {
      throw new ErrorHandler(
        400,
        "createLanguage",
        10003,
        "Name and code are required fields"
      );
    }

    //check for duplicate name;
    let nameFound = await Language.findOne({ name });
    if (nameFound) {
      throw new ErrorHandler(
        400,
        "createLanguage",
        10004,
        "Name already exists"
      );
    }

    //check for duplicate code;
    let codeFound = await Language.findOne({ code });
    if (codeFound) {
      throw new ErrorHandler(
        400,
        "createLanguage",
        10005,
        "code already exists"
      );
    }

    let language = new Language({
      name: name,
      ...body,
      user: user._id,
    });

    await language.save();

    SuccessHandler(res, "success", 201, "ok", language._id);
  } catch (err) {
    return next(err);
  }
};

exports.updateLanguage = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { body, user } = req;
    let updating = {};

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "updateLanguage", 10006, "Malformed ID");
    }

    if (body.name) {
      let name = body.name;
      let languageFound = await Language.findOne({
        name,
        _id: { $nin: id },
      });
      if (languageFound) {
        throw new ErrorHandler(
          400,
          "updateLanguage",
          10007,
          "Language with name already exists"
        );
      }

      updating.name = body.name;
    }

    if (body.code) {
      let code = body.code;
      let codeFound = await Language.findOne({
        code,
        _id: { $nin: id },
      });
      if (codeFound) {
        throw new ErrorHandler(
          400,
          "updateLanguage",
          10008,
          "Language with code already exists"
        );
      }

      updating.code = code;
    }

    let language = await Language.findOneAndUpdate(
      { _id: id },
      {
        ...updating,
        user: user._id,
      },
      { new: true }
    );

    if (!language) {
      throw new ErrorHandler(
        404,
        "updateLanguage",
        10009,
        "Language not found"
      );
    }

    SuccessHandler(res, "success", 201, "ok", language._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteLanguage = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteLanguage", 10010, "Malformed ID");
    }

    // Chcek if the Language with the id is in the database or not?
    let language = await Language.findById(id);
    if (!language) {
      throw new ErrorHandler(
        404,
        "deleteLanguage",
        10011,
        "Language with id not found"
      );
    }

    await Language.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
