import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const PostSchema = new Schema(
  {
    postImage: {
      data: { type: Buffer, required: false, default: null },
      contentType: { type: String, required: false, default: null },
    },
    slug: {
      type: String,
      required: true,
      default: null
    },
    title: {
      type: String,
      required: true,
      default: null
    },
    content: {
      type: String,
      required: true,
      default: null
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "published", "declined", "banned"],
    },
    statusasof: {
      type: Date,
      required: false,
      default: new Date(),
    },
    statusby: {
      ref: "users",
      type: Schema.Types.ObjectId,
      required: false,
      default: null
    },
    remarks: {
      text: {
        type: String,
        required: false,
        default: null
      },
      user: {
        ref: "users",
        type: Schema.Types.ObjectId,
        default: null
      },
    },
    category: {
      ref: "categories",
      type: Schema.Types.ObjectId,
      required: true,
      default: null
    },
    likes: {
      count: { type: Number, default: 0 },
      user: [
        {
          ref: "users",
          type: Schema.Types.ObjectId,
          default: null
        },
      ],
    },
    favorites: {
      count: { type: Number, default: 0 },
      user: [
        {
          ref: "users",
          type: Schema.Types.ObjectId,
          default: null
        },
      ],
    },
    author: {
      ref: "users",
      type: Schema.Types.ObjectId,
      default: null
    },
  },
  { timestamps: true }
);

PostSchema.plugin(Paginator);

const Post = model("posts", PostSchema);
export default Post;
