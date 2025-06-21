const createError = require("http-errors");
const config = require("../../config");
const winston = require("../../utils/logger/logger");

// 404 handler
const notFoundHandler = (req, res, next) => {
  next(createError(404));
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = config.node.env === "development" ? err : {};

  winston.error(err.stack);

  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
