import { Country } from "../models";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllCountries = async (req, res, next) => {
  try {
    Country.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          countries: docs.map((doc) => {
            return {
              id: doc.id,
              name: doc.name,
              iso3: doc.iso3,
              iso2: doc.iso2,
              numeric_code: doc.numeric_code,
              phone_code: doc.phone_code,
              capital: doc.capital,
              currency: doc.currency,
              currency_symbol: doc.currency_symbol,
              tld: doc.tld,
              native: doc.native,
              region: doc.region,
              subregion: doc.subregion,
              timezones: doc.timezones,
              translations: doc.translations,
              latitude: doc.latitude,
              longitude: doc.longitude,
              emoji: doc.emoji,
              emojiU: doc.emojiU,
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

exports.getSingleCountry = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleCountry", 70001, "Malformed ID");
    }

    let country = await Country.findOne({ _id: id });

    if (!country) {
      throw new ErrorHandler(
        404,
        "getSingleCountry",
        70002,
        "Country with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", country);
  } catch (err) {
    return next(err);
  }
};

exports.createCountry = async (req, res, next) => {
  try {
    // Create a new Country
    let { body, user } = req;
    let code = body.code;
    let name = body.name;

    if (!body.name && !body.code) {
      throw new ErrorHandler(
        400,
        "createCountry",
        70003,
        "Name and code are required fields"
      );
    }

    //check for duplicate name;
    let nameFound = await Country.findOne({ name });
    if (nameFound) {
      throw new ErrorHandler(
        400,
        "createCountry",
        70004,
        "Name already exists"
      );
    }

    //check for duplicate code;
    let codeFound = await Country.findOne({ code });
    if (codeFound) {
      throw new ErrorHandler(
        400,
        "createCountry",
        70005,
        "code already exists"
      );
    }

    let Country = new Country({
      name: name,
      ...body,
      user: user._id,
    });

    await Country.save();

    SuccessHandler(res, "success", 201, "ok", Country._id);
  } catch (err) {
    return next(err);
  }
};

exports.updateCountry = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { body, user } = req;
    let updating = {};

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "updateCountry", 70006, "Malformed ID");
    }

    if (body.name) {
      let name = body.name;
      let CountryFound = await Country.findOne({
        name,
        _id: { $nin: id },
      });
      if (CountryFound) {
        throw new ErrorHandler(
          400,
          "updateCountry",
          70007,
          "Country with name already exists"
        );
      }

      updating.name = body.name;
    }

    if (body.code) {
      let code = body.code;
      let codeFound = await Country.findOne({
        code,
        _id: { $nin: id },
      });
      if (codeFound) {
        throw new ErrorHandler(
          400,
          "updateCountry",
          70008,
          "Country with code already exists"
        );
      }

      updating.code = code;
    }

    let country = await Country.findOneAndUpdate(
      { _id: id },
      {
        ...updating,
        user: user._id,
      },
      { new: true }
    );

    if (!country) {
      throw new ErrorHandler(404, "updateCountry", 70009, "Country not found");
    }

    SuccessHandler(res, "success", 201, "ok", country._id);
  } catch (err) {
    return next(err);
  }
};

exports.deleteCountry = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteCountry", 70010, "Malformed ID");
    }

    // Chcek if the Country with the id is in the database or not?
    let country = await Country.findById(id);
    if (!country) {
      throw new ErrorHandler(
        404,
        "deleteCountry",
        70011,
        "Country with id not found"
      );
    }

    await Country.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
