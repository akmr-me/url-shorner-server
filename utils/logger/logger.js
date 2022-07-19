"use strict";
const { createLogger, transports, format } = require("winston");

const { combine, prettyPrint } = format;
const config = require("../../config/index");
const env = config.node.env;
console.log("env:", env);
const root = require("app-root-path");
//Custon setting for transport (File, Console)
const options = {
  file: {
    level: "info",
    json: true,
    filename: `${root}/logs/app.log`,
    handleExceptions: true,
    maxsize: 5242880,
    maxFile: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = createLogger({
  format: combine(
    format.timestamp({
      format: "DD MM YYYY hh:mm:ss",
    }),
    prettyPrint(),
    format.colorize({ all: env === "production" ? false : true })
  ),
  transports: [
    new transports.File({
      ...options.file,
      filename: `${root}/logs/error.log`,
      level: "error",
    }),
    new transports.File(options.file),
  ],
  exitOnError: false,
});

if (env !== "production") {
  logger.add(new transports.Console(options.console));
}

// For morgan logs
logger.stream = {
  stdout: {
    write(message, encoding) {
      //will log in console and file
      logger.info(message);
    },
  },
  stderr: {
    write(message, encoding) {
      logger.error(message);
    },
  },
};

module.exports = logger;
