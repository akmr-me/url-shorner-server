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

  const otpCache = OTPCache.verifyOTP(email, otp);

  if (!otpCache.success) {
    winston.error("Invalid OTP for password reset", { email, otp });
    return res
      .status(400)
      .send({ ...otpCache, message: otpCache.message || "Invalid OTP" });
  }

  if (otpCache.success) {
    const HashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email: email },
      { password: HashPassword }
    );
    if (user.email) {
      await setAuthCookies(res, user.email);

      return res.status(201).json({
        message: `Password changed Successfully`,
        email: user.email,
      });
    }
    return res.status(401).send("User with this Email Id does't exists");
  } else {
    return res.status(401).send("Some error occured/ Wrong OTP");
  }
};
module.exports = generatePassword;
