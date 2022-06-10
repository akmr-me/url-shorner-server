const bcrypt = require("bcrypt");
const createError = require("http-errors");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");

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
  try {
    // Hash Password
    const HashPassword = await bcrypt.hash(password, 10);

    // Get UserSchema
    const user = await User.create({ email: email, password: HashPassword });

    // Here Use of JWT
    res
      .status(201)
      .json({
        message: "User created successfully",
        data: { email: user.email },
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
