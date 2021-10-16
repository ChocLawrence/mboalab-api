import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const TimezoneSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
      default: null,
    },
    abbr: {
      type: String,
      required: true,
      default: null,
    },
    offset: {
      type: Number,
      required: true,
      default: null,
    },
    isdst: {
      type: Boolean,
      required: true,
      default: null,
    },
    text: {
      type: String,
      required: true,
      default: null,
    },
    utc: [{ type: String, default: null }],
  },
  { timestamps: true }
);

TimezoneSchema.plugin(Paginator);

const Timezone = model("timezones", TimezoneSchema);
export default Timezone;
