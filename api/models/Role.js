import { Schema, model } from "mongoose";
import { pick } from "lodash";

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: null
    }
  },
  { timestamps: true }
);

const Role = model("roles", RoleSchema);
export default Role;
