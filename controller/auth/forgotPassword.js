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
    otpCache.set(user.email, otp);

    await sendMail({
      subject: "You OTP For URL Shortner",
      message: `Your OTP is: ${otp}`,
      otp: otp,
      to: user.email,
    });

    return res.status(201).send({
      message: `A 4 digit OTP has been sent to ${email}`,
    });
  } catch (error) {
    winston.error(error.stack);
    return res.status(500).send("Some Error occured...");
  }
};

module.exports = forgotPassword;
