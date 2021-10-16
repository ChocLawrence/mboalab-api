import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const LanguageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      default: null
    },
    code: {
      type: String,
      required: true,
      default: null
    },
  },
  { timestamps: true }
);

LanguageSchema.plugin(Paginator);

const Language = model("languages", LanguageSchema);
export default Language;
