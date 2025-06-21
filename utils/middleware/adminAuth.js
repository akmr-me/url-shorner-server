const jwt = require("jsonwebtoken");
const config = require("../../config");
const ExpireToken = require("../../models/expireToken");
const winston = require("../../utils/logger/logger");

/**
 * Verify admin access middleware
 */
const verifyAdminAccess = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.token;

    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check if token exists in database
    const tokenDoc = await ExpireToken.findOne({ token: refreshToken });
    if (!tokenDoc) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    // Verify token
    const decoded = await jwt.verify(refreshToken, config.jwt.refreshToken);

    if (decoded.email !== config.admin.email) {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    winston.error("Admin authentication error:", error);
    return res.status(401).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

module.exports = { verifyAdminAccess };
