const OTPCache = require("../../DB/otpCache");
const OTP = require("../../utils/otp");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const validator = require("validator");
const sendMail = require("../../utils/mailjet/mailjet");
const config = require("../../config");

const generateOtpForRegistration = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please provide email and password");
  }

  if (!validator.isEmail(email)) {
    winston.error("Invalid email format", { email });
    return res.status(400).send("Please provide a valid email address");
  }

  const passwordValidation = User.passwordValidator(password);
  if (!passwordValidation.isValid) {
    winston.error("Password validation failed", { password });
    return res.status(400).send(passwordValidation.errors[0]);
  }

  const user = await User.findByEmail(email);
  if (user) {
    return res.status(409).send("User already exists with this email!");
  }

  const otp = OTP();

  //   Store the otp to cache
  const { success, ...OTPRest } = OTPCache.storeOTP(email, { otp, password });
  if (!success) {
    winston.error("Failed to store OTP in cache");
    return res.status(400).send({
      ...OTPRest,
      message: OTPRest.message || "Failed to store OTP in cache",
    });
  }
  if (config.node.env === "production") {
    //   Send the OTP to the user via email
    sendMail({
      to: email,
      subject: "Your OTP for Registration",
      otp: otp,
      message: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`,
    });
  } else {
    console.log(`OTP for ${email}: ${otp}`);
  }

  return res.status(200).send({
    message: `A 4 digit OTP has been sent to ${email}`,
  });
};

module.exports = generateOtpForRegistration;
