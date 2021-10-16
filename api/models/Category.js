import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const CategorySchema = new Schema(
  {
    categoryImage: {
      data: { type: Buffer, required: false, default: null },
      contentType: { type: String, required: false, default: null },
    },
    slug: {
      type: String,
      required: true,
      default: null
    },
    description: {
      type: String,
      required: true,
      default: null
    },
    name: {
      type: String,
      required: true,
      default: null
    },
    follows: {
      count: { type: Number, default: 0 },
      user: [
        {
          ref: "users",
          type: Schema.Types.ObjectId,
          default: null
        },
      ],
    },
    user: {
      ref: "users",
      type: Schema.Types.ObjectId,
      default: null
    },
  },
  { timestamps: true }
);

CategorySchema.plugin(Paginator);

const Category = model("categories", CategorySchema);
export default Category;
