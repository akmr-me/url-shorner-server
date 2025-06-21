const jwt = require("jsonwebtoken");
const config = require("../../config");
const ExpireToken = require("../../models/expireToken");
const { genAccessToken } = require("../../utils/token");
const User = require("../../models/userModel");
const logger = require("../../utils/logger/logger");

const refreshController = async (req, res) => {
  try {
    const refreshToken = req.cookies["token"];
    if (!refreshToken) {
      logger.debug("Refresh token missing");
      return res.status(401).json({ error: "Please login again" });
    }

    // Check if token exists in database
    const tokenDoc = await ExpireToken.findOne({ token: refreshToken });

    // Token not found in database - possible replay attack or expired token
    if (!tokenDoc || tokenDoc.isRevoked) {
      logger.warn("Refresh token not found in database");
      res.clearCookie("token");
      res.clearCookie("accessToken");
      return res.status(401).json({ error: "Invalid session" });
    }

    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, config.jwt.refreshToken, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    // Find user
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      logger.warn("User not found for refresh token", { email: decoded.email });
      await ExpireToken.deleteOne({ token: refreshToken });
      return res.status(401).json({ error: "Invalid session" });
    }

    // Generate new access token
    const accessToken = genAccessToken(user.email, decoded.sessionId);

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 2, // 2 minutes
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // Clear guest cookie if exists
    // res.clearCookie("guestId");

    logger.info("Access token refreshed", { email: user.email });

    return res.json({
      email: user.email,
      name: user.name,
      ...(user.googleAuth.picture && { picture: user.googleAuth.picture }),
    });
  } catch (error) {
    logger.error("Token refresh failed:", error);

    // Clear cookies on error
    res.clearCookie("token");
    res.clearCookie("accessToken");

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid session" });
    }

    return res.status(500).json({ error: "Token refresh failed" });
  }
};

module.exports = refreshController;
