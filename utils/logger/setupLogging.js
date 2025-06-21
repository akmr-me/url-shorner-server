const morgan = require("morgan");
const winston = require("./logger");
const config = require("../../config");
const { stderrStream, stdoutStream } = require("./morgan");

/**
 * Sets up logging configuration for the application
 * @param {Express.Application} app - Express application instance
 */
const setupLogging = (app) => {
  // Development logging
  if (config.node.env === "development") {
    app.use(morgan("dev"));

    // Log all requests in development
    app.use((req, res, next) => {
      winston.debug(`${req.method} ${req.url}`);
      next();
    });
  }
  // Production logging
  else {
    // Use custom morgan streams for production
    app.use(morgan("combined", { stream: stdoutStream }));
    app.use(
      morgan("combined", {
        stream: stderrStream,
        skip: (req, res) => res.statusCode < 400,
      })
    );
  }

  // Log unhandled errors
  app.use((err, req, res, next) => {
    winston.error("Unhandled error:", {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
    next(err);
  });
};

module.exports = setupLogging;
