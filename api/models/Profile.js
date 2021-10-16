import { Schema, model } from "mongoose";

const ProfileSchema = new Schema(
  {
    account: {
      ref: "users",
      type: Schema.Types.ObjectId,
      default: null,
    },
    avatar: {
      data: { type: Buffer, required: false, default: null },
      contentType: { type: String, required: false, default: null },
    },
    bio: {
      type: String,
      required: false,
      default: null,
    },
    country: {
      required: false,
      ref: "countries",
      type: Schema.Types.ObjectId,
      default: null,
    },
    timezone: {
      required: false,
      ref: "timezones",
      type: Schema.Types.ObjectId,
      default: null,
    },
    language: {
      required: false,
      ref: "languages",
      type: Schema.Types.ObjectId,
      default: null,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const Profile = model("profiles", ProfileSchema);
export default Profile;
