const debug = require("debug");

/**
 * Namespaced debuggers for different parts of the application
 * Usage:
 * - DEBUG=lnkfy:* (all debuggers)
 * - DEBUG=lnkfy:auth,lnkfy:db (specific debuggers)
 */
const debuggers = {
  // Main app debugger
  app: debug("lnkfy:app"),

  // Authentication related debugging
  auth: debug("lnkfy:auth"),

  // Database operations
  db: debug("lnkfy:db"),

  // URL operations
  url: debug("lnkfy:url"),

  // Server operations
  server: debug("lnkfy:server"),

  // Cache operations
  cache: debug("lnkfy:cache"),

  // Worker operations
  worker: debug("lnkfy:worker"),
};

// Enable all debuggers in development
if (process.env.NODE_ENV === "development") {
  debug.enable("lnkfy:*");
}

module.exports = debuggers;
