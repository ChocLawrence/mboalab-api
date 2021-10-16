import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const CommentSchema = new Schema(
  {
    post: {
      ref: "posts",
      type: Schema.Types.ObjectId,
      default: null
    },
    text: {
      type: String,
      required: true,
      default: null
    },
    user: {
      ref: "users",
      type: Schema.Types.ObjectId,
      default: null
    },
  },
  { timestamps: true }
);

CommentSchema.plugin(Paginator);

const Comment = model("comments", CommentSchema);
export default Comment;
