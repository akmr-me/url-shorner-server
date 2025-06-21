"use strict";
require("dotenv").config();

/**
 * Validate required environment variables
 * @param {string[]} required - List of required environment variables
 * @throws {Error} If any required variable is missing
 */
const validateEnv = (required) => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Required environment variables
const requiredVars = [
  "JWT_ACCESS_TOKEN",
  "JWT_REFRESH_TOKEN",
  "MONGODB_URL",
  "GOOGLE_CLIENT_ID",
];

validateEnv(requiredVars);

const config = {
  node: {
    env: process.env.NODE_ENV || "development",
  },

  app: {
    name: "Linkify",
    port: parseInt(process.env.PORT || "4000", 10),
    baseUrl: process.env.BASE_URL || "http://localhost:4000",
    deletion_period: parseInt(process.env.WORKER_TRIGGER || "86400000", 10), // 24 hours
    apiPrefix: process.env.API_PREFIX || "/api/v1",
  },

  db: {
    mongo: {
      url: process.env.MONGODB_URL,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "10", 10),
      },
    },
  },

  cache: {
    url: {
      stdTtl: parseInt(process.env.URL_CACHE_TTL || "3600", 10), // 1 hour
      checkperiod: parseInt(process.env.URL_CACHE_CHECKPERIOD || "600", 10), // 10 minutes
    },
    restrict: {
      stdTtl: parseInt(process.env.RESTRICT_CACHE_TTL || "300", 10), // 5 minutes
      checkperiod: parseInt(process.env.RESTRICT_CACHE_CHECKPERIOD || "60", 10), // 1 minute
    },
  },

  admin: {
    path: process.env.ADMIN_PATH || "admin",
    pass: process.env.ADMIN_PASSWORD,
  },

  mailjet: {
    enabled: process.env.MAILJET_ENABLED === "true",
    keys: {
      api: process.env.MAILJET_API_KEY,
      secret: process.env.MAILJET_SECERET_KEY,
    },
    sender: {
      email: process.env.MAILJET_SENDER_EMAIL || "noreply@yourdomain.com",
      name: process.env.MAILJET_SENDER_NAME || "URL Shortener",
    },
    templates: {
      welcome: process.env.MAILJET_WELCOME_TEMPLATE,
      reset: process.env.MAILJET_RESET_TEMPLATE,
    },
  },

  jwt: {
    accessToken: process.env.JWT_ACCESS_TOKEN,
    refreshToken: process.env.JWT_REFRESH_TOKEN,
    guestToken: process.env.JWT_GUEST_TOKEN,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
  },

  auth: {
    google: {
      enabled: process.env.GOOGLE_AUTH_ENABLED !== "false",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: process.env.GOOGLE_REDIRECT_URL,
    },
    turnstile: {
      enabled: process.env.TURNSTILE_ENABLED === "true",
      secretKey: process.env.TURNSTILE_SECRET_KEY,
    },
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8", 10),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),
    cookie: {
      accessToken: {
        maxAge: parseInt(
          process.env.ACCESS_TOKEN_COOKIE_MAX_AGE || "900000",
          10
        ), // 15 minutes
        httpOnly: process.env.ACCESS_TOKEN_COOKIE_HTTP_ONLY !== "false",
        secure: process.env.ACCESS_TOKEN_COOKIE_SECURE === "true",
      },
      refreshToken: {
        maxAge: parseInt(
          process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || "604800000",
          10
        ), // 7 days
        httpOnly: process.env.REFRESH_TOKEN_COOKIE_HTTP_ONLY !== "false",
        secure: process.env.REFRESH_TOKEN_COOKIE_SECURE === "true",
      },
    },
  },

  security: {
    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== "false",
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // 100 requests
    },
    cors: {
      enabled: process.env.CORS_ENABLED !== "false",
    },
  },
};

// Freeze configuration to prevent modifications
Object.freeze(config);

module.exports = config;
