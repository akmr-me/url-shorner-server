const config = require("../../config");
const otpCache = require("../../DB/otpCache");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const sendMail = require("../../utils/mailjet/mailjet");
const OTP = require("../../utils/otp");

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  if (!email) return res.status(401).send("Please Send a valid Email");

  try {
    const user = await User.findOne({ email: email });

    if (user == null) {
      return res.status(401).send("User with this Email Id does't exists");
    }

    const otp = OTP();
    const { success, ...OTPRest } = await otpCache.storeOTP(email, {
      otp,
      // password,
    });

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
  } catch (error) {
    winston.error(error.stack);
    return res.status(500).send("Some Error occured...");
  }
};

module.exports = forgotPassword;
