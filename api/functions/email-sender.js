import nodemailer from "nodemailer";
import { APP_NAME, HOST_NAME, HOST_EMAIL, APP_PASSWORD } from "../constants";

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: HOST_EMAIL,
    pass: APP_PASSWORD,
  },
});

async function sendMail(email, subject, html) {
  const msg = {
    html,
    subject,
    to: email,
    from: `'${HOST_NAME} <${HOST_EMAIL}>'`,
  };
  await mailTransport.sendMail(msg);
  return null;
}

export default sendMail;
