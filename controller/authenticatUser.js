const jwt = require("jsonwebtoken");
const config = require("../config/index");
const logger = require("../utils/logger/logger");

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("token");
};

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies["accessToken"];
    const guestId = req.cookies["guestId"];
    const refreshToken = req.cookies["token"];

    if (!accessToken && !guestId & !refreshToken) {
      logger.debug("No authentication tokens found");
      return res.status(401).json({ error: "Authentication required" });
    }

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, config.jwt.accessToken);
        logger.debug("User authenticated", { email: decoded.email });
        req.user = decoded.email;
        req.email = decoded.email;
        return next();
      } catch (error) {
        logger.warn("Access token verification failed", {
          error: error.message,
        });
        res.clearCookie("accessToken");

        if (error instanceof jwt.TokenExpiredError) {
          return res
            .status(406)
            .json({ error: "Session expired. Please try again." });
        }

        return res.status(401).json({ error: "Invalid session" });
      }
    }

    if (refreshToken) {
      return res
        .status(406)
        .json({ error: "Session expired. Please try again." });
    }
    // Handle guest authentication
    if (guestId) {
      try {
        const decoded = jwt.verify(guestId, config.jwt.guestToken);
        if (!decoded || !decoded.guestId) {
          throw new Error("Invalid guest token");
        }

        logger.debug("Guest authenticated", { guestId: decoded.guestId });
        req.guestId = decoded.guestId;
        return next();
      } catch (error) {
        logger.warn("Guest token verification failed", {
          error: error.message,
        });
        res.clearCookie("guestId");
        return res
          .status(440)
          .json({ error: "Guest session expired. Please try again." });
      }
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    clearAuthCookies(res);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = authenticateUser;
