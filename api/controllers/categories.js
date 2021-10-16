import { Category } from "../models";
import { binary } from "../config";
import SlugGenerator from "../functions/slug-generator";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllCategories = async (req, res, next) => {
  try {
    let slug;

    //slug
    if (req.body.slug) {
      slug = { slug: req.body.slug };
    } else {
      slug = {};
    }

    Category.find(slug)
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          categories: docs.map((doc) => {
            if (doc.categoryImage.data) {
              let buffer = doc.categoryImage.data;
              var base64String = buffer.toString("base64");
            }
            return {
              name: doc.name,
              categoryImage: {
                data: base64String ? base64String : null,
                contentType: base64String
                  ? doc.categoryImage.contentType
                  : null,
              },
              slug: doc.slug,
              description: doc.description,
              follows: doc.follows,
              created_at: doc.createdAt,
              updated_at: doc.updatedAt,
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

exports.getSingleCategory = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleCategory", 40000, "Malformed ID");
    }

    let category = await Category.findOne({ _id: id }).map((doc) => {
      if (!doc) {
        throw new ErrorHandler(
          404,
          "getSingleCategory",
          40001,
          "Category with id not found"
        );
      }

      if (doc.categoryImage.data) {
        let buffer = doc.categoryImage.data;
        var base64String = buffer.toString("base64");
      }

      return {
        name: doc.name,
        categoryImage: {
          data: base64String ? base64String : null,
          contentType: base64String ? doc.categoryImage.contentType : null,
        },
        slug: doc.slug,
        description: doc.description,
        follows: doc.follows,
        _id: doc._id,
      };
    });

    SuccessHandler(res, "success", 200, "ok", category);
  } catch (err) {
    return next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    // Create a new Category
    let { body, files } = req;
    let slug = SlugGenerator(body.name);

    let matchFound = await Category.find({
      slug: `${slug}`,
    });

    if (matchFound.length > 0) {
      throw new ErrorHandler(
        400,
        "createCategory",
        20012,
        "Category with same name exists"
      );
    }

    let category = new Category({
      user: req.user._id,
      categoryImage: {
        data: binary(files.file.data),
        contentType: files.file.mimetype,
      },
      name: body.name ? body.name : null,
      description: body.description ? body.description : null,
      slug: `${slug}`,
    });

    let cat = await category.save();

    SuccessHandler(res, "success", 201, "ok", cat);
  } catch (err) {
    return next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user, files, body } = req;
    let newImage, newImageMime;
    let updating = {};
    // Chcek if the category with the id is in the database or not?
    let category = await Category.findById(id);

    if (!category) {
      throw new ErrorHandler(
        404,
        "updateCategory",
        40002,
        "Category not found"
      );
    }

    if (category.user.toString() !== user._id.toString()) {
      throw new ErrorHandler(
        401,
        "updateCategory",
        40003,
        "Cannot change category you didn't create"
      );
    }

    if (body.name) {
      let slug = SlugGenerator(body.name);
      let nameFound = await Category.findOne({
        slug,
        _id: { $nin: id },
      });
      if (nameFound) {
        throw new ErrorHandler(
          400,
          "updateCategory",
          80006,
          "Category with name already exists"
        );
      }

      updating.name = body.name;
      updating.slug = slug;
    }

    if (body.description) {
      updating.description = body.description;
    }

    if (files) {
      newImage = binary(files.file.data);
      newImageMime = files.file.mimetype;

      updating.categoryImage = {
        data: newImage,
        contentType: newImageMime,
      };
    }

    await Category.findOneAndUpdate(
      { user: user._id, _id: id },
      {
        ...updating,
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteCategory", 40004, "Malformed ID");
    }

    // Chcek if the category with the id is in the database or not?
    let category = await Category.findById(id);
    if (!category) {
      throw new ErrorHandler(
        404,
        "deleteCategory",
        40004,
        "Category with id not found"
      );
    }
    if (category.user.toString() !== user._id.toString()) {
      throw new ErrorHandler(
        401,
        "deleteCategory",
        40005,
        "Category doesn't belong to you."
      );
    }

    category = await Category.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.followCategory = async (req, res, next) => {
  try {
    let { id } = req.params;
    let category = await Category.findById(id);
    if (!category) {
      throw new ErrorHandler(
        404,
        "followCategory",
        40005,
        "Category not found"
      );
    }

    let user = category.follows.user.map((id) => id.toString());
    if (user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "followCategory",
        40006,
        "You have already followed this category."
      );
    }

    await Category.findOneAndUpdate(
      { _id: id },
      {
        follows: {
          count: category.follows.count + 1,
          user: [...category.follows.user, req.user._id],
        },
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.unfollowCategory = async (req, res, next) => {
  try {
    let { id } = req.params;
    let category = await Category.findById(id);
    if (!category) {
      throw new ErrorHandler(
        404,
        "unfollowCategory",
        40007,
        "Category not found"
      );
    }

    let user = category.follows.user.map((id) => id.toString());
    if (!user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "unfollowCategory",
        40008,
        "You have not followed this category before"
      );
    }

    for (var i = user.length - 1; i >= 0; i--) {
      if (user[i] == req.user._id.toString()) {
        user.splice(i, 1);
      }
    }

    await Category.findOneAndUpdate(
      { _id: id },
      {
        follows: {
          count: category.follows.count - 1,
          user: [...user],
        },
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
