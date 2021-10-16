import { Post, Comment, Category } from "../models";
import { binary } from "../config";
import SlugGenerator from "../functions/slug-generator";
import createNotification from "../functions/notification";
import { validDate, subtractMonths } from "../functions/generic";
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllPosts = async (req, res, next) => {
  try {
    let { category, start, end, status, count, slug } = req.query;
    let finalStart = "";
    let finalEnd = "";
    let today = new Date();

    if (category && !category.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getAllPosts", 21001, "Malformed ID");
    }

    if (category && category.match(/^[0-9a-fA-F]{24}$/)) {
      var categoryFound = await Category.findOne({ _id: `${category}` });

      if (!categoryFound) {
        throw new ErrorHandler(
          404,
          "getAllPosts",
          21002,
          "Category with id not found"
        );
      }
    }

    if (start) {
      start = new Date(start);
    } else {
      var date = new Date();
      start = subtractMonths(date, 1);
    }

    if (!validDate(start)) {
      throw new ErrorHandler(404, "getAllPosts", 21016, "Invalid start date");
    }

    start.toISOString();
    finalStart = new Date(start);

    if (end) {
      end = new Date(end);
    } else {
      end = today;
    }

    if (!validDate(end)) {
      throw new ErrorHandler(404, "getAllPosts", 21017, "Invalid end date");
    }

    //check if start date is less than end date
    if (end <= start) {
      throw new ErrorHandler(
        404,
        "getAllPosts",
        21018,
        "End date cannot be less than or equal to start date"
      );
    }

    // if (end > today) {
    //   throw new ErrorHandler(
    //     404,
    //     "getAllUserTransactions",
    //     21019,
    //     "End date cannot be in the future"
    //   );
    // }

    end.setUTCHours(23, 59, 59, 999);
    end.toISOString();

    finalEnd = new Date(end);

    let searchObject = {
      createdAt: {
        $gte: finalStart,
        $lt: finalEnd,
      },
    };

    if (categoryFound) {
      searchObject.category = categoryFound._id;
    }

    if (slug) {
      searchObject.slug = slug;
    }

    if (
      status &&
      (status == "pending" || status == "published" || status == "banned")
    ) {
      searchObject.status = status;
    }

    Post.find(searchObject)
      .limit(count ? parseInt(count) : null)
      .sort({ createdAt: -1 })
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          posts: docs.map((doc) => {
            if (doc.postImage.data) {
              let buffer = doc.postImage.data;
              var base64String = buffer.toString("base64");
            }

            return {
              title: doc.title,
              postImage: {
                data: base64String ? base64String : null,
                contentType: base64String ? doc.postImage.contentType : null,
              },
              content: doc.content,
              slug: doc.slug,
              status: doc.status,
              category: doc.category,
              likes: doc.likes,
              favorites: doc.favorites,
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

exports.getSinglePost = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSinglePost", 12000, "Malformed ID");
    }

    let post = await Post.findOne({ _id: id }).map((doc) => {
      if (!doc) {
        throw new ErrorHandler(
          404,
          "getSinglePost",
          12001,
          "Post with id not found"
        );
      }

      let buffer = doc.postImage.data;
      let base64String = buffer.toString("base64");

      return {
        title: doc.title,
        postImage: {
          data: base64String,
          contentType: doc.postImage.contentType,
        },
        content: doc.content,
        slug: doc.slug,
        status: doc.status,
        category: doc.category,
        likes: doc.likes,
        favorites: doc.favorites,
        createdat: doc.createdAt,
        updatedat: doc.updatedAt,
        _id: doc._id,
      };
    });

    if (!post) {
      throw new ErrorHandler(
        404,
        "getSinglePost",
        12002,
        "Post with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", post);
  } catch (err) {
    return next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    // Create a new Post
    let { body, files } = req;
    var image, imageMime;

    let slug = SlugGenerator(body.title);

    //check for duplicate slug;
    let slugFound = await Post.findOne({ slug });
    if (slugFound) {
      throw new ErrorHandler(
        400,
        "createPost",
        12003,
        "A title like this already exists"
      );
    }

    if (files) {
      image = binary(files.file.data);
      imageMime = files.file.mimetype;
    }

    let post = new Post({
      author: req.user._id,
      postImage: {
        data: image ? image : null,
        contentType: imageMime ? imageMime : null,
      },
      ...body,
      slug: slug,
    });

    await post.save();

    SuccessHandler(res, "success", 201, "ok", post._id);
  } catch (err) {
    return next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user, files, body } = req;
    var currentImage, currentContentType, newImage, newImageMime;
    // Chcek if the post with the id is in the database or not?
    let post = await Post.findById(id);

    if (!post) {
      throw new ErrorHandler(404, "updatePost", 12004, "Post not found");
    }

    if (post.author.toString() !== user._id.toString()) {
      throw new ErrorHandler(
        401,
        "updatePost",
        12005,
        "Post doesn't belong to you."
      );
    }

    if (post.postImage.data) {
      currentImage = post.postImage.data;
      currentContentType = post.postImage.contentType;
    }

    if (files) {
      newImage = binary(files.file.data);
      newImageMime = files.file.mimetype;
    }

    post = await Post.findOneAndUpdate(
      { author: user._id, _id: id },
      {
        ...body,
        postImage: {
          data: newImage ? newImage : currentImage,
          contentType: newImageMime ? newImageMime : currentContentType,
        },
        slug: SlugGenerator(body.title),
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", post._id);
  } catch (err) {
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deletePost", 12006, "Malformed ID");
    }

    // Chcek if the post with the id is in the database or not?
    let post = await Post.findById(id);
    if (!post) {
      throw new ErrorHandler(
        404,
        "deletePost",
        12007,
        "Post with id not found"
      );
    }

    if (user.role !== "admin") {
      if (post.author.toString() !== user._id.toString()) {
        throw new ErrorHandler(
          401,
          "deletePost",
          12008,
          "Post doesn't belong to you."
        );
      }
    }

    //delete comments of post
    await Comment.deleteMany({
      post: post._id,
    });

    post = await Post.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      throw new ErrorHandler(404, "likePost", 12009, "Post not found");
    }

    let user = post.likes.user.map((id) => id.toString());
    if (user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "likePost",
        12010,
        "You have already liked this post."
      );
    }

    post = await Post.findOneAndUpdate(
      { _id: id },
      {
        likes: {
          count: post.likes.count + 1,
          user: [...post.likes.user, req.user._id],
        },
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.unLikePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      throw new ErrorHandler(404, "unLikePost", 12011, "Post not found");
    }

    let user = post.likes.user.map((id) => id.toString());
    if (!user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "unLikePost",
        12012,
        "You have not liked this post before"
      );
    }

    for (var i = user.length - 1; i >= 0; i--) {
      if (user[i] == req.user._id.toString()) {
        user.splice(i, 1);
      }
    }

    post = await Post.findOneAndUpdate(
      { _id: id },
      {
        likes: {
          count: post.likes.count - 1,
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

exports.favoritePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      throw new ErrorHandler(404, "favoritePost", 12013, "Post not found");
    }

    let user = post.favorites.user.map((id) => id.toString());
    if (user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "favoritePost",
        12014,
        "You have already marked this post as favorite."
      );
    }

    post = await Post.findOneAndUpdate(
      { _id: id },
      {
        favorites: {
          count: post.favorites.count + 1,
          user: [...post.favorites.user, req.user._id],
        },
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};

exports.unFavoritePost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
      throw new ErrorHandler(404, "unFavoritePost", 12015, "Post not found");
    }

    let user = post.favorites.user.map((id) => id.toString());
    if (!user.includes(req.user._id.toString())) {
      throw new ErrorHandler(
        404,
        "unFavoritePost",
        12016,
        "You have not marked this post as favorite before"
      );
    }

    for (var i = user.length - 1; i >= 0; i--) {
      if (user[i] == req.user._id.toString()) {
        user.splice(i, 1);
      }
    }

    post = await Post.findOneAndUpdate(
      { _id: id },
      {
        favorites: {
          count: post.favorites.count - 1,
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

exports.processPost = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user, body } = req;

    let status = body.status;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "processPost", 12017, "Malformed ID");
    }

    // Check if the post with the id is in the database or not?
    let post = await Post.findById(id);

    if (!user) {
      throw new ErrorHandler(404, "processPost", 12018, "Post not found");
    }

    if (req.user.role !== "admin") {
      throw new ErrorHandler(401, "processPost", 12019, "Not authorized");
    }

    if (
      status !== "published" &&
      status !== "declined" &&
      status !== "banned"
    ) {
      throw new ErrorHandler(404, "processPost", 12020, "Invalid status");
    }

    post = await Post.findOneAndUpdate(
      { _id: id },
      {
        status: status,
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", post);
  } catch (err) {
    return next(err);
  }
};
