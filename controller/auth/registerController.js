const bcrypt = require("bcrypt");
const createError = require("http-errors");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const { genAccessToken, genRefreshToken } = require("../../utils/token");

// Handle Error
const handleError = (err) => {
  let error = { password: "", email: "" };
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(error.properties);
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
    const refreshToken = genRefreshToken(email);
    // Here Use of JWT
    res.cookie("token", refreshToken, {
      maxAge: 1000 * 60 * 24,
      httpOnly: false,
    });

    res.status(201).json({
      message: `Welcome ${user.email}`,
      accessToken,
      email: user.email,
      // data: { email: user.email },
    });
  } catch (error) {
    if (error.code === 11000 && error.message.includes("duplicate key error")) {
      // Error code 409 This response is sent when a request conflicts with the current state of the server
      return next(
        createError(
          409,
          `Already have an account with Email: ${email}. Please login to continue.`
        )
      );
    }
    // winston.error(error);
    const err = handleError(error);
    if (err) {
      winston.error(err);
      return next(createError(400, err.email));
    }
    return next(createError);
  }
};

module.exports = register;
