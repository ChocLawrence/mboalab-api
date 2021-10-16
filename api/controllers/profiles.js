import { ErrorHandler, SuccessHandler } from "../functions/response-handler";
import { Profile, User, Country, Language, Timezone } from "../models";
import { fs, binary, ObjectId } from "../config";

exports.getAllProfiles = async (req, res, next) => {
  try {
    Profile.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          profiles: docs.map((doc) => {
            return {
              account: doc.account,
              avatar: doc.avatar,
              bio: doc.bio,
              country: doc.country,
              timezones: doc.timezones,
              language: doc.language,
              address: doc.address,
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

exports.myProfile = async (req, res, next) => {
  try {
    if (!req.user._id) {
      throw new ErrorHandler(401, "myProfile", 13001, "unAuthorized Action");
    }

    let userId = req.user._id.toString();

    let profile = await Profile.findOne({ account: new ObjectId(userId) }).map(
      (doc) => {
        if (!doc) {
          throw new ErrorHandler(
            404,
            "myProfile",
            13002,
            "Profile with account not found"
          );
        }

        if (doc.avatar.data) {
          let buffer = doc.avatar.data;
          var base64String = buffer.toString("base64");
        }

        return {
          account: doc.account,
          avatar: {
            data: base64String ? base64String : null,
            contentType: base64String ? doc.avatar.contentType : null,
          },
          bio: doc.bio,
          language: doc.language,
          country: doc.country,
          timezone: doc.timezone,
          address: doc.address,
          _id: doc._id,
        };
      }
    );

    if (!profile) {
      throw new ErrorHandler(
        404,
        "myProfile",
        13003,
        "Your profile is not available."
      );
    }

    SuccessHandler(res, "success", 200, "ok", profile);
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    let { body, files, user } = req;
    let updating = {};
    var currentImage, currentContentType, newImage, newImageMime;

    let profile = await Profile.findOne({ account: user._id });

    if (!profile) {
      throw new ErrorHandler(
        401,
        "updateProfile",
        13004,
        "Your profile could not be found.Create one."
      );
    }

    if (user.role !== "admin") {
      if (profile.account.toString() !== user._id.toString()) {
        throw new ErrorHandler(
          401,
          "updateProfile",
          13005,
          "Profile doesn't belong to you."
        );
      }
    }

    if (profile.avatar.data) {
      currentImage = profile.avatar.data;
      currentContentType = profile.avatar.contentType;
    }

    if (files) {
      newImage = binary(files.file.data);

      if (
        files.file.mimetype !== "image/png" &&
        files.file.mimetype !== "image/jpg" &&
        files.file.mimetype !== "image/jpeg"
      ) {
        throw new ErrorHandler(
          404,
          "updateProfile",
          13006,
          "Image must be valid"
        );
      } else {
        newImageMime = files.file.mimetype;
      }
    }

    //verify ids of country,language,timezones
    if (body.country) {
      let country = await Country.findById(body.country);
      if (!country) {
        throw new ErrorHandler(
          404,
          "updateProfile",
          13007,
          "Country with Id not found"
        );
      }
      updating.country = body.country;
    }

    if (body.language) {
      let language = await Language.findById(body.language);
      if (!language) {
        throw new ErrorHandler(
          404,
          "updateProfile",
          13008,
          "Language with Id not found"
        );
      }
      updating.language = body.language;
    }

    if (body.timezone) {
      let timezone = await Timezone.findById(body.timezone);
      if (!timezone) {
        throw new ErrorHandler(
          404,
          "updateProfile",
          13009,
          "Timezone with Id not found"
        );
      }
      updating.timezone = body.timezone;
    }

    if (body.bio) {
      updating.bio = body.bio;
    }

    if (body.address) updating.address = body.address;

    await Profile.findOneAndUpdate(
      { account: user._id },
      {
        avatar: {
          data: newImage ? newImage : currentImage,
          contentType: newImageMime ? newImageMime : currentContentType,
        },
        ...updating,
      },
      { new: true }
    );

    SuccessHandler(res, "success", 201, "ok", null);
  } catch (error) {
    return next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    let { username } = req.params;
    let userName = username.toLowerCase();
    let user = await User.findOne({ username: userName });

    if (!user) {
      throw new ErrorHandler(404, "getProfile", 13010, "User not found.");
    }

    if (user._id.toString() !== req.user._id.toString()) {
      throw new ErrorHandler(401, "getProfile", 13011, "Unauthorized access");
    }

    let profile = await Profile.findOne({ account: user._id }).map((doc) => {
      if (!doc) {
        throw new ErrorHandler(
          404,
          "getProfile",
          13012,
          "Your profile could not be found.Create one."
        );
      }

      if (doc.avatar.data) {
        let buffer = doc.avatar.data;
        var base64String = buffer.toString("base64");
      }

      return {
        account: doc.account,
        avatar: {
          data: base64String ? base64String : null,
          contentType: base64String ? doc.avatar.contentType : null,
        },
        bio: doc.bio,
        country: doc.country,
        language: doc.language,
        address: doc.address,
        _id: doc._id,
      };
    });

    if (!profile) {
      throw new ErrorHandler(
        401,
        "getProfile",
        13013,
        "Your profile could not be found.Create one."
      );
    }

    let resultObj = {
      ...profile,
      account: user.getUserInfo(),
    };

    SuccessHandler(res, "success", 200, "ok", resultObj);
  } catch (error) {
    return next(error);
  }
};
