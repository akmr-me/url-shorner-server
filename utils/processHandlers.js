const winston = require("./logger/logger");
const sendMail = require("./mailjet/mailjet");

const setupProcessHandlers = (app, closeConnection) => {
  // Unhandled Promise Rejections
  process.on("unhandledRejection", (reason, promise) => {
    winston.error({
      reason,
      message: "Unhandled Rejection at Promise",
      promise,
    });
    // sendMail({ message: reason.toString() });
  });

  // Uncaught Exceptions
  process.on("uncaughtException", (err) => {
    winston.error(err);
    process.exit(1);
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = (signal) => {
    winston.info(`${signal} received. Starting graceful shutdown...`);
    app.get("SERVER").close(() => {
      winston.info("Server closed");
      closeConnection().then(() => {
        winston.info("Database connection closed");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

module.exports = setupProcessHandlers;
