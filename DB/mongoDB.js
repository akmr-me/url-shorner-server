const mongoose = require("mongoose");
const debug = require("../config/debug");
const winston = require("../utils/logger/logger");
require("dotenv").config();
const dbURI = process.env.MONGODB_URL;
debug("dbURI:", dbURI);
//Event handler on mongodb connection
function onError(err) {
  winston.error(`MONGODB connection Error: ${err}`);
}
function onConnection() {
  winston.info("MONGODB connected...");
}

function onReconnection() {
  winston.info("Database Reconnected..");
}

function onDbClose() {
  winston.info("Database is closed succefully");
}

function connectDB() {
  //TODO : give auto reconnect option in mongoose.connect
  mongoose.connect(dbURI);

  const db = mongoose.connection;

  //Diffrent events of mondodb connection
  //Events not used here are *connecting, open(db.once), disconnected
  db.on("error", onError);
  db.on("connected", onConnection);
  db.on("reconnected", onReconnection);
  db.on("close", onDbClose);
  return db;
}

module.exports = connectDB;
