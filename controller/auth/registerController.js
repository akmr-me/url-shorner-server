const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const { genAccessToken, genRefreshToken } = require("../../utils/token");
const config = require("../../config");
const { setAuthCookies } = require("../../utils/auth/register");
const { migrateGuestUrls } = require("../../utils/url/migrateGuestUrls");
const OTPCache = require("../../DB/otpCache");

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
  const { otp, email, password, rememberMe = true } = req.body;
  if (!email || !password || !otp) {
    winston.error("Missing required fields for registration", {
      email,
      password,
      otp,
    });
    return res.status(400).send("Please provide email, password and otp");
  }

  try {
    // Check in cache for otp
    const otpCache = await OTPCache.verifyOTP(email, otp);

    if (!otpCache.success) {
      winston.error("Invalid OTP for registration", { email, otp });
      return res
        .status(400)
        .send({ ...otpCache, message: otpCache.message || "Invalid OTP" });
    }

    const user = await User.create({
      email: email,
      password: password,
    });

    await migrateGuestUrls(req.cookies["guestId"], user._id);
    await setAuthCookies(res, user.email);

    return res.status(201).json({
      message: `Welcome ${user.email}`,
      email: user.email,
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
    winston.error(error);
    const err = handleError(error);
    if (err) {
      winston.error(err);
      return res.status(400).send(err.email);
    }
    return res.status(500).send("Some Error Occured");
  }
};

module.exports = register;
