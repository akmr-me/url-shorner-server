const { model } = require("mongoose");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const User = require("../../models/userModel");
const config = require("../../config/index");
const getURL = require("../getURL");

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send("Invalid credential Please register");
    }
    // Check whether password match or not with hashed one in DB
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      // Create jwt access token
      const accessToken = jwt.sign(
        { email: user.email },
        config.jwt.accessToken,
        { expiresIn: "30s" }
      );
      // Refresh token
      const refreshToken = jwt.sign(
        { email: user.email },
        config.jwt.refreshToken,
        { expiresIn: "24m" }
      );

      // Set cookie with refreshToken
      res.cookie("token", refreshToken, {
        maxAge: 1000 * 60 * 24,
        httpOnly: false,
      });
      const allUrl = await getURL(user.urls, user.email);

      return res.status(200).json({
        message: `Welcome back ${user.email}`,
        accessToken,
        email: user.email,
        data: {
          urls: allUrl,
        },
      });
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.log(error + "from login controler");
    // return next(createError);
    return;
  }
};

module.exports = login;
