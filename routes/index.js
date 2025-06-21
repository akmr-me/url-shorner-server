const { Router } = require("express");
const authenticateUser = require("../controller/authenticatUser");
const {
  urlGeneratorLimiter,
} = require("../controller/rateLimiter/rateLimiter");
const config = require("../config/index");

// Route groups
const authRoutes = require("./auth");
const urlRoutes = require("./url");
const adminRoutes = require("./admin");

module.exports = (app) => {
  const apiRouter = Router();

  // Auth Routes Group
  apiRouter.use("/auth", authRoutes);

  // URL Management Routes Group
  apiRouter.use("/url", urlRoutes);

  // API version prefix
  app.use("/api/v2", apiRouter);

  // Public URL Redirect Route (no auth required)
  app.use("/", require("./redirectShortUrl"));

  // Admin Routes (with admin middleware)
  if (config.admin.enabled) {
    app.use(`/admin`, [authenticateUser, requireAdmin], adminRoutes);
  }
};
