import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const FeedbackSchema = new Schema(
  {
    response: {
      type: String,
      required: false,
      default: null
    },
    response_by: {
      ref: "users",
      type: Schema.Types.ObjectId,
      required: false,
      default: null
    },
    message: {
      type: String,
      required: true,
      default: null
    },
    user: {
      ref: "users",
      type: Schema.Types.ObjectId,
      required: true,
      default: null
    },
  },
  { timestamps: true }
);

FeedbackSchema.plugin(Paginator);

const Feedback = model("Feedbacks", FeedbackSchema);
export default Feedback;
