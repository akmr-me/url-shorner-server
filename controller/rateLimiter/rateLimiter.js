const rateLimit = require("express-rate-limit");

const urlGeneratorLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many URL Generated from this IP, please try again after 30s",
});
const otpLimiter = rateLimit({
  windowMs: 4 * 60 * 60 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  // skipFailedRequests: true,
  message: "Too many OTP Generated from this IP, Try after 4 hours",
});
const loginLimiter = rateLimit({
  windowMs: 4 * 60 * 60 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  // skipFailedRequests: true,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (request, response) => response.statusCode < 400,
  message: "Too many failed try to Login from this IP, Try after 4 hours",
});

module.exports = { urlGeneratorLimiter, otpLimiter, loginLimiter };
