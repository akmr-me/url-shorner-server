const router = require("express").Router();
const config = require("../config/index");
const path = require("path");
const fs = require("fs");
const ExpireToken = require("../models/expireToken");
const jwt = require("jsonwebtoken");

const middleware = async (req, res, next) => {
  if (!req.headers["cookie"])
    return res.status(401).send("Please Login Again 😡😠👿");
  const refreshToken = req.headers["cookie"].split("=")[1];
  const tokenStatus = await ExpireToken.findOne({ token: refreshToken });
  if (refreshToken && !tokenStatus) {
    jwt.verify(refreshToken, config.jwt.refreshToken, async (err, user) => {
      if (err) {
        // Wrong refresh tokenn
        return res.status(406).send("Unauthorized 😡😠👿");
      }
      if (user.email) {
        req.email = user.email;
        return next();
      } else {
        return res.status(406).send("Unauthorized Email 😡😠👿");
      }
    });
  }
};
router.get("/applog", middleware, (req, res, next) => {
  if (req.email && req.email === config.admin.pass) {
    res.download(path.join(__dirname, "..", "/logs/app.log"), (err) => {
      if (err) return res.sendStatus(403);
    });
  }
  return res.status(403).send("Your dont't have access to this page😡😠👿");
});
router.get("/errorlog", middleware, (req, res, next) => {
  if (req.email && req.email === config.admin.pass) {
    res.download(path.join(__dirname, "..", "/logs/error.log"), (err) => {
      if (err) return res.sendStatus(403);
    });
  }
  return res.status(403).send("Your dont't have access to this page😡😠👿");
});
router.get("/applogdelete", middleware, (req, res, next) => {
  if (req.email && req.email === config.admin.pass) {
    fs.writeFile(path.join(__dirname, "..", "/logs/app.log"), "", function () {
      console.log("App log cleared");
      res.sendStatus(204);
    });
  }
  return res.status(403).send("Your dont't have access to this page😡😠👿");
});
router.get("/errorlogdelete", middleware, (req, res, next) => {
  if (req.email && req.email === config.admin.pass) {
    fs.writeFile(
      path.join(__dirname, "..", "/logs/error.log"),
      "",
      function () {
        console.log("ERROR log cleared");
        res.sendStatus(204);
      }
    );
  }
  return res.status(403).send("Your dont't have access to this page😡😠👿");
});
module.exports = router;
