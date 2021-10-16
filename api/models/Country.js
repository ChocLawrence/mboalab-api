import { Schema, model } from "mongoose";
import Paginator from "mongoose-paginate-v2";

const CountrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: null,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      default: null,
    },
    iso3: {
      type: String,
      default: null,
    },
    iso2: {
      type: String,
      default: null,
    },
    numeric_code: {
      type: String,
      default: null,
    },
    phone_code: {
      type: String,
      default: null,
    },
    capital: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    currency_symbol: {
      type: String,
      default: null,
    },
    tld: {
      type: String,
      default: null,
    },
    native: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    subregion: {
      type: String,
      default: null,
    },
    timezones: {
      type: Object,
      default: null,
    },
    translations: {
      type: Object,
      default: null,
    },
    latitude: {
      type: String,
      default: null,
    },
    longitude: {
      type: String,
      default: null,
    },
    emoji: {
      type: String,
      default: null,
    },
    emojiU: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

CountrySchema.plugin(Paginator);

const Country = model("countries", CountrySchema);
export default Country;
