import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const SubscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      default: null
    },
  },
  { timestamps: true }
);

SubscriberSchema.plugin(Paginator);

const Subscriber = model("subscribers", SubscriberSchema);
export default Subscriber;
