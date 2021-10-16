import { config } from "dotenv";

config();

export const PORT = process.env.PORT || process.env.APP_PORT;
export const SECRET = process.env.APP_SECRET;
export const SERVER_TIMEZONE = process.env.TZ;
export const DB = process.env.PORT
  ? process.env.MONGO_ATLAS_TESTING
  : process.env.APP_DB_LOCAL;
export const DOMAIN = process.env.PORT
  ? process.env.APP_DOMAIN_TESTING
  : process.env.APP_DOMAIN_LOCAL;
export const API_DOMAIN = process.env.PORT
  ? process.env.APP_API_DOMAIN_TESTING
  : process.env.APP_API_DOMAIN_LOCAL;
export const APP_NAME = process.env.APP_NAME;
export const HOST_NAME = process.env.HOST_NAME;
export const HOST_EMAIL = process.env.HOST_EMAIL;
export const APP_PASSWORD = process.env.HOST_PASSWORD;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
