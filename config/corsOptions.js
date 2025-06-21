const config = require("./index");
const logger = require("../utils/logger/logger");

/**
 * Allowed origins based on environment
 * In production, specify exact domains
 * In development, allow localhost ports
 */
const allowedOrigins = {
  development: [
    "http://localhost:3000",
    "http://localhost:4002",
    "http://127.0.0.1:8080",
    "http://localhost:8002",
  ],
  production: [
    "https://www.akmr.me",
    // Add other production domains here
  ],
};

/**
 * Default CORS options
 */
const defaultOptions = {
  // Only allow specific HTTP methods
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  // Allow specific headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  // Cache preflight requests for 1 hour
  maxAge: 3600,

  // Enforce strict SSL in production
  secure: process.env.NODE_ENV === "production",
};

/**
 * CORS configuration delegate
 * @param {Object} req - Express request object
 * @param {Function} callback - CORS callback function
 */
const corsOptionsDelegate = (req, callback) => {
  const origin = req.header("Origin");
  const env = process.env.NODE_ENV || "development";

  try {
    // Check if origin is allowed
    const isAllowed = allowedOrigins[env]?.includes(origin);

    if (isAllowed) {
      logger.debug("CORS allowed for origin:", { origin });

      callback(null, {
        ...defaultOptions,
        origin: true,
        credentials: true,
      });
    } else {
      logger.warn("CORS blocked for origin:", {
        origin,
        ip: req.ip,
      });

      callback(null, {
        ...defaultOptions,
        origin: false,
        credentials: false,
      });
    }
  } catch (error) {
    logger.error("CORS error:", {
      error: error.message,
      origin,
      ip: req.ip,
    });

    callback(error);
  }
};

module.exports = corsOptionsDelegate;

//  Access to XMLHttpRequest at 'http://localhost:4000/login' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by cors"));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: function (origin, callback) {
//     console.log(origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by cors"));
//     }
//   },
// // };
