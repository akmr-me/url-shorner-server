const rateLimit = require("express-rate-limit");
const debug = require("debug")("url-shortener:rate-limiter");

// Configuration constants - could be moved to environment variables
const RATE_LIMITS = {
  URL_GENERATOR: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: "Too many URLs generated. Please try again after 10 minutes.",
  },
  OTP: {
    windowMs: 4 * 60 * 60 * 1000, // 4 hours
    max: 4,
    message: "Too many OTP requests. Please try again after 4 hours.",
  },
  LOGIN: {
    windowMs: 4 * 60 * 60 * 1000, // 4 hours
    max: 4,
    message: "Too many failed login attempts. Please try again after 4 hours.",
  },
};

// Custom error handler for rate limiting
const handleRateLimit = (req, res) => {
  debug(`Rate limit exceeded for IP: ${req.ip}`);
  return res.status(429).json({
    status: "error",
    message: "Too many requests. Please try again later.",
    retryAfter: res.getHeader("Retry-After"),
  });
};

// URL Generator rate limiter
const urlGeneratorLimiter = rateLimit({
  windowMs: RATE_LIMITS.URL_GENERATOR.windowMs,
  max: RATE_LIMITS.URL_GENERATOR.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMITS.URL_GENERATOR.message,
  handler: handleRateLimit,
  keyGenerator: (req) => {
    // Use both IP and user ID (if available) to prevent abuse
    return req.user ? `${req.ip}-${req.user.id}` : req.ip;
  },
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: RATE_LIMITS.OTP.windowMs,
  max: RATE_LIMITS.OTP.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: RATE_LIMITS.OTP.message,
  handler: handleRateLimit,
  keyGenerator: (req) => {
    // Use email or IP to track limits
    return req.body.email || req.ip;
  },
});

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.windowMs,
  max: RATE_LIMITS.LOGIN.max,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (request, response) => response.statusCode < 400,
  message: RATE_LIMITS.LOGIN.message,
  handler: handleRateLimit,
  keyGenerator: (req) => {
    // Use both IP and email/username to prevent distributed attacks
    return `${req.ip}-${req.body.email || req.body.username || ""}`;
  },
});

module.exports = { urlGeneratorLimiter, otpLimiter, loginLimiter };
