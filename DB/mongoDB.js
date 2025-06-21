const mongoose = require("mongoose");
const { server: debug } = require("../config/debug");
const winston = require("../utils/logger/logger");
require("dotenv").config();

let dbConnection = null;

const mongooseOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  writeConcern: {
    w: "majority",
  },
  authSource: "admin",
};

function onError(err) {
  winston.error(`MongoDB connection error: ${err.message}`);
  debug(`MongoDB error details: ${err.stack}`);
}

function onConnection() {
  winston.info("MongoDB connected successfully");
  debug(
    `MongoDB connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`
  );
}

function onReconnection() {
  winston.info("Database reconnected successfully");
  debug("Reconnection triggered: checking database state...");
}

function onDisconnect() {
  winston.warn("Database connection lost. Attempting to reconnect...");
}

function onDbClose() {
  winston.info("Database connection closed successfully");
  dbConnection = null;
}

async function closeConnection() {
  if (dbConnection) {
    try {
      await mongoose.connection.close();
      winston.info("Database connection closed through app termination");
    } catch (err) {
      console.log(err);
      winston.error(`Error while closing database connection: ${err.message}`);
    }
  }
}

async function connectWithRetry(retryAttempts = 5) {
  const dbURI = process.env.MONGODB_URL;

  if (!dbURI) {
    throw new Error(
      "MongoDB connection URL not found in environment variables"
    );
  }

  try {
    debug("Attempting to connect to MongoDB...");
    const connection = await mongoose.connect(dbURI, mongooseOptions);
    dbConnection = connection.connection;
    return dbConnection;
  } catch (err) {
    if (retryAttempts > 0) {
      winston.warn(
        `Failed to connect to MongoDB. Retrying... (${retryAttempts} attempts left)`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectWithRetry(retryAttempts - 1);
    }
    throw new Error(
      `Failed to connect to MongoDB after multiple attempts: ${err.message}`
    );
  }
}

async function connectDB() {
  try {
    process.on("SIGINT", closeConnection);
    process.on("SIGTERM", closeConnection);

    mongoose.connection.on("error", onError);
    mongoose.connection.on("connected", onConnection);
    mongoose.connection.on("reconnected", onReconnection);
    mongoose.connection.on("disconnected", onDisconnect);
    mongoose.connection.on("close", onDbClose);

    const db = await connectWithRetry();
    return db;
  } catch (err) {
    winston.error(`Failed to initialize database connection: ${err.message}`);
    throw err;
  }
}

module.exports = { connectDB, closeConnection };
