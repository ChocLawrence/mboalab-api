import cors from "cors";
import consola from "consola";
import express from "express";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import passport from "passport";
import { join } from "path";
import { json } from "body-parser";
const { ErrorHandler, handleError } = require("./functions/response-handler");

// Import Application Constants
import { DB, PORT } from "./constants";

// Router imports
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";
import commentRoutes from "./routes/comments";
import profileRoutes from "./routes/profiles";
import categoryRoutes from "./routes/categories";
import notificationRoutes from "./routes/notifications";
import subscriberRoutes from "./routes/subscribers";
import feedbackRoutes from "./routes/feedbacks";
import countryRoutes from "./routes/countries";
import timezoneRoutes from "./routes/timezones";
import languageRoutes from "./routes/languages";

// Import passport middleware
require("./middlewares/passport-middleware");

// Initialize express application
const app = express();

// Apply Application Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  fileUpload({
    limits: {
      fileSize: 3000000, //1mb
    },
    abortOnLimit: true,
  })
);
app.use(passport.initialize());
app.set("view engine", "ejs");
app.use("/", express.static(join(__dirname, "./templates")));

// Inject Sub router and apis
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/profiles", profileRoutes);
app.use("/categories", categoryRoutes);
app.use("/notifications", notificationRoutes);
app.use("/subscribers", subscriberRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/countries", countryRoutes);
app.use("/timezones", timezoneRoutes);
app.use("/languages", languageRoutes);

//error handler
app.use((req, res, next) => {
  throw new ErrorHandler(
    404,
    req.url,
    "Endpoint not found or bad request method"
  );
});

app.use((err, req, res, next) => {
  handleError(err, res);
});

const main = async () => {
  try {
    // Connect with the database
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    consola.success("DATABASE CONNECTED...");
    // Start application listening for request on server
    app.listen(PORT, () => consola.success(`Sever started on port ${PORT}`));
  } catch (err) {
    consola.error(`Unable to start the server \n${err.message}`);
  }
};

main();
