import { DOMAIN } from "../constants";
import { Comment } from "../models";
import { join } from "path";
const fs = require("fs");
import { ErrorHandler, SuccessHandler } from "../functions/response-handler";

exports.getAllComments = async (req, res, next) => {
  try {
    Comment.find()
      .exec()
      .then((docs) => {
        const response = {
          count: docs.length,
          comments: docs.map((doc) => {
            return {
              text: doc.text,
              user: doc.user,
              post: doc.post,
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

exports.getSingleComment = async (req, res, next) => {
  try {
    let { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "getSingleComment", 50000, "Malformed ID");
    }

    let comment = await Comment.findOne({ _id: id });

    if (!comment) {
      throw new ErrorHandler(
        404,
        "getSingleComment",
        50001,
        "Comment with id not found"
      );
    }

    SuccessHandler(res, "success", 200, "ok", comment);
  } catch (err) {
    return next(err);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    // Create a new Comment
    let { body, params } = req;

    let comment = new Comment({
      user: req.user._id,
      text: body.text,
      post: params.id,
    });

    await comment.save();

    SuccessHandler(res, "success", 201, "ok", comment);
  } catch (err) {
    return next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user, body } = req;
    // Chcek if the post with the id is in the database or not?
    let comment = await Comment.findById(id);

    if (!comment) {
      throw new ErrorHandler(404, "updateComment", 50002, "Comment not found");
    }

    if (comment.user.toString() !== user._id.toString()) {
      throw new ErrorHandler(
        401,
        "updateComment",
        50003,
        "Comment doesn't belong to you."
      );
    }

    comment = await Comment.findOneAndUpdate(
      { user: user._id, _id: id },
      {
        ...body,
        post: comment.post,
      },
      { new: true }
    );

    SuccessHandler(res, "success", 200, "ok", comment);
  } catch (err) {
    return next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user } = req;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      // Yes, it's a valid ObjectId, proceed with `findById` call.
      throw new ErrorHandler(404, "deleteComment", 50004, "Malformed ID");
    }

    // Chcek if the post with the id is in the database or not?
    let comment = await Comment.findById(id);
    if (!comment) {
      throw new ErrorHandler(
        404,
        "deleteComment",
        50005,
        "Comment with id not found"
      );
    }

    if (user.role !== "admin") {
      if (comment.user.toString() !== user._id.toString()) {
        throw new ErrorHandler(
          401,
          "deleteComment",
          50006,
          "Comment doesn't belong to you."
        );
      }
    }

    comment = await Comment.deleteOne({ _id: id });

    SuccessHandler(res, "success", 200, "ok", null);
  } catch (err) {
    return next(err);
  }
};
