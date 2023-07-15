"use strict";
require("dotenv").config();
module.exports = {
  node: {
    env: process.env.NODE_ENV,
  },
  app: {
    port: process.env.PORT,
    deletion_period: process.env.WORKER_TRIGGER,
  },

  db: {
    mongo: {
      url: process.env.MONGODB_URL,
    },
  },

  cache: {
    url: {
      stdTtl: process.env.URL_CACHE_TTL,
      checkperiod: process.env.URL_CACHE_CHECKPERIOD,
    },
    restrict: {
      stdTtl: process.env.RESTRICT_CACHE_TTL,
      checkperiod: process.env.RESTRICT_CACHE_CHECKPERIOD,
    },
  },
  admin: {
    path: process.env.ADMIN_PATH,
    pass: process.env.ADMIN_PASSWORD,
  },
  mailjet: {
    keys: {
      api: process.env.MAILJET_API_KEY,
      secret: process.env.MAILJET_SECERET_KEY,
    },
    sender: {
      email: process.env.MAILJET_SENDER_EMAIL,
      name: process.env.MAILJET_SENDER_NAME,
    },
  },
  jwt: {
    accessToken: process.env.JWT_ACCESS_TOKEN,
    refreshToken: process.env.JWT_REFRESH_TOKEN,
  },
};
