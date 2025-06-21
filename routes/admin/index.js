const router = require("express").Router();
const path = require("path");
const fs = require("fs").promises;
const winston = require("../../utils/logger/logger");
const { verifyAdminAccess } = require("../../utils/middleware/adminAuth");
const { adminLimiter } = require("../../middleware/rateLimiter");

/**
 * Log file paths configuration
 */
const LOG_PATHS = {
  app: path.join(__dirname, "..", "/logs/app.log"),
  error: path.join(__dirname, "..", "/logs/error.log"),
};

/**
 * Download log file
 * @param {string} logPath - Path to log file
 */
const downloadLog = async (logPath, res) => {
  try {
    await fs.access(logPath); // Check if file exists
    res.download(logPath, (err) => {
      if (err) {
        winston.error("Error downloading log file:", err);
        return res.status(500).json({
          status: "error",
          message: "Could not download log file",
        });
      }
    });
  } catch (error) {
    winston.error("Log file access error:", error);
    return res.status(404).json({
      status: "error",
      message: "Log file not found",
    });
  }
};

/**
 * Clear log file
 * @param {string} logPath - Path to log file
 */
const clearLog = async (logPath, res) => {
  try {
    await fs.writeFile(logPath, "");
    winston.info(`Log file cleared: ${logPath}`);
    return res.status(204).send();
  } catch (error) {
    winston.error("Error clearing log file:", error);
    return res.status(500).json({
      status: "error",
      message: "Could not clear log file",
    });
  }
};

// Apply rate limiting to all admin routes
router.use(adminLimiter);

// Download logs
router.get("/logs/app", verifyAdminAccess, async (req, res) => {
  await downloadLog(LOG_PATHS.app, res);
});

router.get("/logs/error", verifyAdminAccess, async (req, res) => {
  await downloadLog(LOG_PATHS.error, res);
});

// Clear logs
router.delete("/logs/app", verifyAdminAccess, async (req, res) => {
  await clearLog(LOG_PATHS.app, res);
});

router.delete("/logs/error", verifyAdminAccess, async (req, res) => {
  await clearLog(LOG_PATHS.error, res);
});

module.exports = router;
