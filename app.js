const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoDB = require("./DB/mongoDB");

// We dont have to call it as function in line 16 it is already being called
// Above line is wrong it just calls module console.log by just importing but not call function mongoDB

const debug = require("./config/debug");
const config = require("./config/index");
const winston = require("./utils/logger/logger");

const genrateUrl = require("./routes/genrateUrl");
const redirectShortUrl = require("./routes/redirectShortUrl");
const sendMail = require("./utils/mailjet/mailjet");
const ipRestrict = require("./utils/middleware/ipRestrict");

const app = express();

// Connnect MONGODB
mongoDB();

/**
 * When running Express app behind a proxy we need to detect client IP address correctly.
 * For NGINX the following must be configured 'proxy_set_header X-Forwarded-For $remote_addr;'
 * @link http://expressjs.com/en/guide/behind-proxies.html
 */
app.set("trust proxy", true);

// Headers
const cors = require("cors");
const corsOptionsDelegate = require("./config/corsOptions");
const authenticateUser = require("./controller/authenticatUser");
app.use(cors(corsOptionsDelegate));
// cors({credentials})
app.use(helmet());

// Conditional morgan logging
if (config.node.env === "development") {
  const logger = require("morgan");
  app.use(logger("dev"));
} else {
  const { stderrStream, stdoutStream } = require("./utils/logger/morgan");
  app.use(stdoutStream, stderrStream);
}

//Other important middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
// Auth Routes
app.use("/register", require("./routes/auth/register"));
app.use("/login", require("./routes/auth/login"));
app.use("/refresh", require("./routes/auth/refresh"));
app.use("/forgotPassword", require("./routes/auth/forgotPassword"));
app.use("/otp", require("./routes/auth/otp"));
app.use("/generatePassword", require("./routes/auth/generatePassword"));
// Error was due to delete from url model but can get that short form user model
app.use("/", require("./routes/deleteUrl"));

//Routes
// app.use("/test", require("./routes/test"));
app.use("/", redirectShortUrl);
app.use("/", ipRestrict, authenticateUser, genrateUrl);

// Catch 404 and forward to error handler TODO put this in middleWare
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler TODO put this in middle ware
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = config.node.env === "development" ? err : {};
  debug("Ip Address", req.ip);
  winston.debug(err.message);
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});
// The 'unhandledRejection' event is emitted when Promise is rejected at there is no error handler attached to it
// it just gives warning and does't exit the process
// Promise.reject("this is a custom error"); // This was test promise
process.on("unhandledRejection", (reason, promise) => {
  // sendMail({ message: reason });
  winston.error({ reason, message: "Unhadnled Rejection at Promise", promise });
});

//Invoking worker thread for regular deletion of unused URLs later get time from environment variable
setTimeout(() => {
  console.log("timer start");
  const databaseUpdate = require("./utils/worker/worker");
  databaseUpdate()
    .then((data) => {
      sendMail({ message: `Deleted record ${data.deletedCount}` });
      console.log(` Deleted record ${data.deletedCount}`);
    })
    .catch((e) => console.log(e.message));
}, config.app.deletion_period);

//In case of uncaucht exception
process.on("uncaughtException", (err) => {
  winston.error(err);
  process.exit(1);
});

process.on("SIGINT", (signal) => {
  winston.warn("Termianted by programmer using ::>  " + signal);
});

module.exports = app;
