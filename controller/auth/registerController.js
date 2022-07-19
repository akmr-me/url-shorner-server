const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const { genAccessToken, genRefreshToken } = require("../../utils/token");
const getURL = require("../getURL");

// Handle Error
const handleError = (err) => {
  let error = { password: "", email: "" };
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
    return error;
  }
  return null;
};

const register = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const urls = req.body.urls;
  const rememberMe = req.body.rememberMe;
  try {
    // Hash Password
    const HashPassword = await bcrypt.hash(password, 10);

    // Get UserSchema
    const user = await User.create({
      email: email,
      password: HashPassword,
      urls: urls,
    });
    const accessToken = genAccessToken(email);
    const refreshToken = rememberMe && genRefreshToken(email);
    // Here Use of JWT
    if (rememberMe) {
      res.cookie("token", refreshToken, {
        maxAge: 1000 * 60 * 24,
        httpOnly: true,
        secure: true,
      });
    }
    const allUrl = await getURL(urls, email);

    res.status(201).json({
      message: `Welcome ${user.email}`,
      accessToken,
      email: user.email,
      rememberMe: rememberMe,
      data: {
        urls: allUrl,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.message.includes("duplicate key error")) {
      // Error code 409 This response is sent when a request conflicts with the current state of the server
      return res
        .status(409)
        .send(
          `Already have an account with Email: ${email}. Please login to continue.`
        );
    }
    // winston.error(error);
    const err = handleError(error);
    if (err) {
      winston.error(err);
      return res.status(400).send(err.email);
    }
    return res.status(500).send("Some Error Occured");
  }
};

module.exports = register;
