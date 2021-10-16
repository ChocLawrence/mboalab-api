import { check } from "express-validator";
const firstname = check("firstname", "firstname is required").not().isEmpty();
const lastname = check("lastname", "lastname is required").not().isEmpty();
const username = check("username", "username is required").not().isEmpty();
const email = check("email", "Email must be valid").isEmail();
const password = check(
  "password",
  "Password is required with minimum length of 6"
)
  .isLength({ min: 6 })
  .not()
  .isEmpty();
const oldpassword = check("oldpassword", "Old password required")
  .not()
  .isEmpty();

const value = check("value", "Value is required").not().isEmpty();
const gender = check("gender", "gender is required").not().isEmpty();
const offset = check("offset", "offset is required").not().isEmpty();
const abbr = check("abbr", "abbr is required").not().isEmpty();
const isdst = check("isdst", "isdst is required").not().isEmpty();
const text = check("text", "text is required").not().isEmpty();
const utc = check("utc", "utc is required").not().isEmpty();
const phone = check("phone", "Phone is required").not().isEmpty();
const code = check("code", "Code is required").not().isEmpty();
const contest = check("contest", "Contest is required").not().isEmpty();
const resetPasswordToken = check(
  "resetPasswordToken",
  "PasswordToken is required"
)
  .not()
  .isEmpty();
const user = check("user", "User is required").not().isEmpty();
const content = check("content", "Content is required").not().isEmpty();
const title = check("title", "Title is required").not().isEmpty();
const category = check("category", "Category for the post is required.")
  .not()
  .isEmpty();

const sender = check("sender", "Sender is required").not().isEmpty();
const receiver = check("receiver", "Receiver is required").not().isEmpty();
const message = check("message", "Message is required").not().isEmpty();
const name = check("name", "Name is required").not().isEmpty();

const summary = check("summary", "Summary is required").not().isEmpty();
const description = check("description", "Description is required")
  .not()
  .isEmpty();
const details = check("details", "Details is required").not().isEmpty();
const rating = check("rating", "Rating is required").not().isEmpty();

const image = check("file", "file")
  .isEmpty()
  .custom((value, { req }) => {
    if (!req.files) throw new Error("file is required");

    if (
      req.files.file.mimetype !== "image/png" &&
      req.files.file.mimetype !== "image/jpg" &&
      req.files.file.mimetype !== "image/jpeg"
    )
      throw new Error("File should be a valid image");

    return true;
  });

const pdf = check("file", "file")
  .isEmpty()
  .custom((value, { req }) => {
    if (!req.files) throw new Error("file is required");

    if (req.files.file.mimetype !== "application/pdf")
      throw new Error("File should be a pdf");
    return true;
  });

//exports

export const RegisterValidations = [
  password,
  firstname,
  lastname,
  gender,
  username,
  email,
];
export const emailValidations = [email];
export const notificationValidations = [summary, details, sender, receiver];
export const countryValidations = [name, code];
export const languageValidations = [name, code];
export const timezoneValidations = [value, abbr, offset, text, isdst, utc];
export const codeValidations = [code];
export const ResetPasswordNowValidations = [resetPasswordToken, password];
export const AuthenticateValidations = [username, password];
export const ResetPassword = [email];
export const subscriberValidations = [email];
export const postValidations = [title, content, category];
export const feedbackValidations = [message];
export const updatePasswordValidations = [oldpassword, password];
export const commentValidations = [text];
export const imageValidations = [image];
export const pdfValidations = [pdf];
export const categoryValidations = [name, description];
