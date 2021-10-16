import { Schema, model } from "mongoose";
import { compare, hash } from "bcryptjs";
import { SECRET } from "../constants";
import { randomBytes } from "crypto";
import { sign } from "jsonwebtoken";
import { pick } from "lodash";

const UserSchema = new Schema(
  {
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "banned"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["m", "f", "u"],
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      default: null
    },
    lastname: {
      type: String,
      required: true,
      default: null
    },
    username: {
      type: String,
      required: true,
      unique: true,
      default: null
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: null
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    profile: {
      type: String,
      default: "0",
      enum: ["0", "1"],
    },
    loggedin: {
      type: String,
      default: "0",
      enum: ["0", "1"],
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
      default: null
    },
    verificationCodeExpiresIn: {
      type: Date,
      required: false,
      default: null
    },
    resetPasswordToken: {
      type: String,
      required: false,
      default: null
    },
    resetPasswordExpiresIn: {
      type: Date,
      required: false,
      default: null
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  let user = this;
  if (!user.isModified("password")) return next();
  user.password = await hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

UserSchema.methods.generateJWT = async function () {
  let payload = {
    username: this.username,
    email: this.email,
    role: this.role,
    gender: this.gender,
    profile: this.profile,
    loggedin: this.loggedin,
    firstname: this.firstname,
    lastname: this.lastname,
    id: this._id,
  };
  return await sign(payload, SECRET, { expiresIn: "1 day" });
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordExpiresIn = Date.now() + 3600000;
  this.resetPasswordToken = randomBytes(10).toString("hex");
};

UserSchema.methods.getUserInfo = function () {
  return pick(this, [
    "_id",
    "username",
    "email",
    "firstname",
    "lastname",
    "status",
    "role",
    "profile",
    "loggedin",
    "gender",
    "verified",
  ]);
};

const User = model("users", UserSchema);
export default User;
