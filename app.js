const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { connectDB, closeConnection } = require("./DB/mongoDB");
const config = require("./config/index");
const {
  notFoundHandler,
  errorHandler,
} = require("./utils/middleware/errorHandler");
const setupProcessHandlers = require("./utils/processHandlers");
const corsOptionsDelegate = require("./config/corsOptions");
const setupLogging = require("./utils/logger/setupLogging");

const app = express();

// DB Connection
const DBConnection = connectDB();

// Basic Security
app.set("trust proxy", true);
app.use(helmet());
app.use(cors(corsOptionsDelegate));

// Logging
setupLogging(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
require("./routes")(app); // Create a routes/index.js to organize all routes

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Process Handlers
setupProcessHandlers(app, closeConnection);

// URL Cleanup Worker
const startCleanupWorker = require("./utils/worker/setupWorker");
startCleanupWorker();

module.exports = app;
