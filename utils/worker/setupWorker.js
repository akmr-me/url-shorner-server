const winston = require("../logger/logger");
const sendMail = require("../mailjet/mailjet");
const config = require("../../config");
const databaseUpdate = require("./worker");

/**
 * Sets up a periodic worker to cleanup unused URLs and expired tokens
 * @returns {NodeJS.Timeout} The interval object
 */
const startCleanupWorker = () => {
  // Initial delay before first cleanup
  const INITIAL_DELAY = 1000 * 60 * 5 * 24; // 5 minutes

  winston.info("URL cleanup worker initialized");

  // Run initial cleanup after delay
  const initialCleanup = setTimeout(async () => {
    try {
      const result = await databaseUpdate();
      const message = `
        Cleanup completed at ${new Date(result.CurrentDate)}
        URLs deleted: ${result.urlDeletionCount.deletedCount}
        Tokens deleted: ${result.tokenDeletionCount.deletedCount}
      `;

      winston.info(message);
      await sendMail({ message });
    } catch (error) {
      winston.error("Initial cleanup failed:", error);
    }
  }, INITIAL_DELAY);

  // Setup periodic cleanup
  const periodicCleanup = setInterval(async () => {
    try {
      const result = await databaseUpdate();
      const message = `
        Cleanup completed at ${new Date(result.CurrentDate)}
        URLs deleted: ${result.urlDeletionCount.deletedCount}
        Tokens deleted: ${result.tokenDeletionCount.deletedCount}
      `;

      winston.info(message);
      await sendMail({ message });
    } catch (error) {
      winston.error("Periodic cleanup failed:", error);
    }
  }, config.app.deletion_period);

  // Handle cleanup on process shutdown
  process.on("SIGTERM", () => {
    clearTimeout(initialCleanup);
    clearInterval(periodicCleanup);
    winston.info("URL cleanup worker stopped");
  });

  return periodicCleanup;
};

module.exports = startCleanupWorker;
