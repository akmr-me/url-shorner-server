const jwt = require("jsonwebtoken");
const config = require("../../config");
const ExpireToken = require("../../models/expireToken");
const winston = require("../../utils/logger/logger");

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.token;
    const accessToken = req.cookies.accessToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshToken);
        const sessionId = decoded.sessionId;
        // Delete any existing expired tokens for this user/system
        if (sessionId) {
          const token = await ExpireToken.findOne({ sessionId });
          token.revoke();
        }
      } catch (err) {
        winston.error(`Invalid refresh token during logout: ${err.message}`);
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("token");

    // Log the logout event
    winston.info(
      `User logged out successfully${req.user ? ` - User ID: ${req.user}` : ""}`
    );

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    winston.error("Logout error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error during logout",
    });
  }
};

module.exports = logout;
