const jwt = require("jsonwebtoken");
const config = require("../config");
const ExpireToken = require("../models/expireToken");
const winston = require("../utils/logger/logger");
const router = require("express").Router();

router.get("/", async (req, res) => {
  const cookie = req.headers["cookie"];

  if (cookie) {
    const userToken = cookie.split("=")[1];

    jwt.verify(userToken, config.jwt.refreshToken, async (err, data) => {
      if (err) {
        res.cookie("token", null, {
          maxAge: 0,
        });
        res.sendStatus(204);
        return;
      }
      try {
        const token = await ExpireToken.create({
          token: userToken,
          date: data.exp, //jwt in second
        });
      } catch (error) {
        winston.error(error.stack);
      }
    });
  }

  res.cookie("token", null, {
    maxAge: 0,
  });
  res.sendStatus(204);
});

module.exports = router;
