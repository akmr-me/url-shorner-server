"use strict";
const morgan = require("morgan");

const logger = require("./logger");

const stderrStream = (req, res, next) => {
  morgan(
    ":remote-addr ':method :url HTTP/:http-version' :status :res[content-length] - :response-time ms",
    {
      skip: function (req, res) {
        return res.statusCode < 400;
      },
      stream: logger.stream.stderr,
    }
  )(req, res, next);
};

const stdoutStream = (req, res, next) => {
  morgan("short", {
    skip: function () {
      return res.statusCode >= 400;
    },
    stream: logger.stream.stdout,
  })(req, res, next);
};

module.exports = {
  stderrStream,
  stdoutStream,
};
