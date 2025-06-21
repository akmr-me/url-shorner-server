const router = require("express").Router();
const ShortURL = require("../models/urlModel");
const logger = require("../utils/logger/logger");
const config = require("../config");
const UAParser = require("ua-parser-js");
const URL_NOT_EXISTS = require("../utils/templates/NotExists");

const isRedirectLoop = (url) => {
  try {
    const urlObj = new URL(url);
    // Check if URL points to our own domain and path
    const appHost = new URL(config.app.baseUrl).host;
    return urlObj.host === appHost;
  } catch (error) {
    return false;
  }
};

router.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const session = await ShortURL.startSession();
  let redirectUrl;

  try {
    const result = await session.withTransaction(
      async () => {
        // Find the URL document within transaction
        const doc = await ShortURL.findOne({ short: shortUrl }).session(
          session
        );

        if (!doc) {
          logger.warn("Invalid short URL accessed", { shortUrl });
          throw new Error("URL not found");
        }

        // Check for redirect loops
        if (isRedirectLoop(doc.fullUrl)) {
          logger.warn("Redirect loop detected", {
            shortUrl,
            fullUrl: doc.fullUrl,
          });
          throw new Error("Redirect loop detected");
        }

        const parser = new UAParser();
        parser.setUA(req.headers["user-agent"]);
        const ua = parser.getResult();

        const analytics = {
          timestamp: Date.now(),
          ip: req.ip,
          // userAgent: req.get("user-agent"),
          referer: req.get("referer"),
          country: req.get("cf-ipcountry") || "unknown",
          device: ua.device.type || "unknown",
          browser: ua.browser.name || "unknown",
          os: ua.os.name || "unknown",
          deviceDetails: ua.device,
        };
        // Update document with new click data
        doc.clicks += 1;
        doc.lastClicked = Date.now();

        // Update analytics maps if they exist in schema
        if (doc.analytics) {
          // Update country stats
          const currentCountryCount =
            doc.analytics.countries.get(analytics.country) || 0;
          doc.analytics.countries.set(
            analytics.country,
            currentCountryCount + 1
          );

          // Update referrer stats
          if (analytics.referer) {
            const currentRefererCount =
              doc.analytics.referrers.get(analytics.referer) || 0;
            doc.analytics.referrers.set(
              analytics.referer,
              currentRefererCount + 1
            );
          }

          // Update browser stats
          const currentBrowserCount =
            doc.analytics.browsers.get(analytics.browser) || 0;
          doc.analytics.browsers.set(
            analytics.browser,
            currentBrowserCount + 1
          );

          // Update device stats
          const currentDeviceCount =
            doc.analytics.devices.get(analytics.device) || 0;
          doc.analytics.devices.set(analytics.device, currentDeviceCount + 1);
        }

        await doc.save({ session });

        // Log successful redirect with analytics
        logger.info("URL redirect", {
          shortUrl,
          fullUrl: doc.fullUrl,
          clicks: doc.clicks,
          analytics,
        });

        // Store the URL for redirect after transaction commits
        redirectUrl = doc.fullUrl;
        return true;
      },
      {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" },
      }
    );

    if (result.ok === 1 && redirectUrl) {
      return res.redirect(redirectUrl);
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    logger.error("URL redirect failed", {
      shortUrl,
      error: error.message,
      error,
    });

    // Handle specific errors
    if (error.message === "URL not found") {
      return res.status(404).send(URL_NOT_EXISTS);
    } else if (error.message === "Redirect loop detected") {
      return res.status(400).json({
        error: "Cannot redirect to the URL shortener itself",
      });
    }

    return res.status(500).json({
      error: "Failed to process redirect",
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
