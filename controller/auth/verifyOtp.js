const OTPCache = require("../../DB/otpCache");
const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const { genAccessToken, genRefreshToken } = require("../../utils/token");
const { setAuthCookies } = require("../../utils/auth/register");
const winston = require("../../utils/logger/logger");

const generatePassword = async (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const password = req.body.password;

  const otpCache = await OTPCache.verifyOTP(email, otp);

  if (!otpCache.success) {
    winston.error("Invalid OTP for password reset", { email, otp });
    return res
      .status(400)
      .send({ ...otpCache, message: otpCache.message || "Invalid OTP" });
  }

  //   One sucessful OTP verification, clears so setting same otp again
  OTPCache.storeOTP(email, { otp });

  if (otpCache.success) {
    return res.status(201).json({
      message: `OTP verified successfully`,
    });
  } else {
    return res.status(401).send("Some error occured/ Wrong OTP");
  }
};
module.exports = generatePassword;
