const logger = require("../../utils/logger/logger");
const URL = require("../../models/urlModel");
const config = require("../../config");
const jwt = require("jsonwebtoken");

const migrateGuestUrls = async (guestId, userId) => {
  try {
    if (!guestId) return;

    const decoded = jwt.verify(guestId, config.jwt.guestToken);
    if (!decoded?.guestId) return;

    await URL.updateMany({ guestId: decoded.guestId }, { userId });

    logger.info(
      `Migrated URLs from guest ${decoded.guestId} to user ${userId}`
    );
  } catch (error) {
    logger.error("Failed to migrate guest URLs:", error);
  }
};

module.exports = { migrateGuestUrls };
