const express = require("express");
const router = express.Router();
const ShortURL = require("../../models/urlModel");
const { isValidUrl, checkDns } = require("../../utils/is_url");
const logger = require("../../utils/logger/logger");
const User = require("../../models/userModel");
const config = require("../../config");

const validateUrl = async (url) => {
  if (!url) {
    return "URL is required";
  }

  if (!isValidUrl(url)) {
    return "Invalid URL format";
  }

  try {
    const urlObj = new URL(url.includes("http") ? url : `https://${url}`);
    const appHost = new URL(config.app.baseUrl).host;
    if (urlObj.host === appHost) {
      return "Cannot shorten URLs from this domain";
    }
  } catch (error) {
    logger.error("URL validation failed", {
      error: error.message,
    });
    return "Invalid URL format";
  }

  const dnsStatus = await checkDns(url);
  if (!dnsStatus) {
    return "Invalid DNS record for this URL";
  }

  return null;
};

const createShortUrl = async (urlData, maxRetries = 3) => {
  try {
    const result = await ShortURL.create(urlData);
    return result;
  } catch (error) {
    if (
      error.code === 11000 &&
      error.name === "MongoServerError" &&
      maxRetries > 0
    ) {
      logger.warn("Short URL collision, retrying...");
      return createShortUrl(urlData, maxRetries - 1);
    }
    throw error;
  }
};

const generateShortUrl = async (req, res) => {
  const { fullURL, alias } = req.body;

  try {
    // Validate URL
    const validationError = await validateUrl(fullURL);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Get user information
    let userId = null;
    if (req.user || req.email) {
      const user = await User.findOne({ email: req.email });
      if (user) {
        userId = user._id;
      }
    }

    if (!userId && !req.guestId) {
      return res.status(400).json({ error: "No User Found" });
    }
    // Create short URL
    try {
      const result = await createShortUrl(
        {
          fullUrl: fullURL,
          ...(userId && { userId }),
          ...(req.guestId && { guestId: req.guestId }),
          ...(alias && { short: alias }),
        },
        alias ? 0 : 3
      );

      logger.info("Short URL created", {
        short: result.short,
        fullUrl: result.fullUrl,
        userId,
        guestId: req.guestId,
      });

      return res.status(201).json({
        short: result.short,
        full: result.fullUrl,
        clicks: result.clicks,
        lastClicked: result.lastClicked,
      });
    } catch (error) {
      // Check if duplicate key error
      if (error.code === 11000 && error.name === "MongoServerError" && alias) {
        logger.warn("Short URL alias already exists", {
          alias,
          fullUrl: fullURL,
        });
        return res.status(409).json({
          error: "Short URL alias already exists",
        });
      }
      logger.error("Failed to create short URL", {
        error: error.message,
        fullUrl: fullURL,
      });
      return res.status(500).json({
        error: "Failed to create short URL",
      });
    }
  } catch (error) {
    logger.error("Failed to create short URL", {
      error: error.message,
      fullUrl: fullURL,
    });

    return res.status(500).json({
      error: "Failed to create short URL",
    });
  }
};

module.exports = generateShortUrl;
