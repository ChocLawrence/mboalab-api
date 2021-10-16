import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const NotificationSchema = new Schema(
  {
    summary: {
      type: String,
      required: true,
      default: null
    },
    details: {
      type: String,
      required: true,
      default: null
    },
    read: {
      type: Boolean,
      default: false,
      default: null
    },
    priority: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 3, 4, 5],
      required: false,
    },
    label: {
      type: String,
      default: "default",
      enum: ["default", "feedback", "transaction", "reminder", "bankwire"],
      required: true,
    },
    sender: {
      type: String,
      required: true,
      default: null
    },
    deleted: {
      type: Boolean,
      default: false,
      required: false,
      default: null
    },
    receiver: {
      ref: "users",
      type: Schema.Types.ObjectId,
      required: true,
      default: null
    },
  },
  { timestamps: true }
);

NotificationSchema.plugin(Paginator);

const Notification = model("notifications", NotificationSchema);
export default Notification;
