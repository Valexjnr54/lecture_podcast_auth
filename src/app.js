const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const Config = require("./config/config");
require("./helpers/init_redis");
const LecturerAuthRouter = require("./routes/Auths/lecturerAuthRoutes");
const LearnerAuthRouter = require("./routes/Auths/studentAuthRoutes");
const AdminAuthRouter = require("./routes/Auths/adminAuthRoutes");
const lecturerContentRouter = require("./routes/Lecturer/contentLibrary");
const contentRouter = require("./routes/Contents/contents");
const searchRouter = require("./routes/searchRoutes");
const settingLecturerRouter = require("./routes/Lecturer/settings");
const settingStudentRouter = require("./routes/Student/studentSettings");
const settingAdminRouter = require("./routes/Admin/adminSettings");
const refreshTokenRouter = require("./routes/refreshTokenRoutes");
const notificationRouter = require("./routes/notificationRoutes");

require("dotenv").config();
require("./helpers/init_mongoose");

const app = express();
app.use(morgan("combined"));

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cors({ origin: Config.corsAllowedOrigin || "*" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const route = "/api/v1";

app.get("/", (req, res, next) => {
  return res.send("Lecture Podcast Starts");
});
// Authentication Routes Starts
app.use(route + "/auth", LecturerAuthRouter);
app.use(route + "/auth", LearnerAuthRouter);
app.use(route + "/auth", AdminAuthRouter);
app.use(route, refreshTokenRouter);

app.use(route + "/lecturer/content", lecturerContentRouter);
app.use(route + "/content", contentRouter);
app.use(route + "/lecturer/settings", settingLecturerRouter);

app.use(route + "/student/settings", settingStudentRouter);
app.use(route + "/admin/settings", settingAdminRouter);

app.use(route + "/search", searchRouter);

app.use(route + "/notification", notificationRouter);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.use(express.urlencoded({ extended: true }));

module.exports = app;
