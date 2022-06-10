const createError = require("http-errors");
const otpCache = require("../../DB/otpCache");
const User = require("../../models/userModel");
const sendMail = require("../../utils/mailjet/mailjet");
const OTP = require("../../utils/otp");

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  if (!email)
    return res.status(401).send({ message: "Please Send a valid Email" });

  try {
    const user = await User.findOne({ email: email });

    if (user == null) {
      return res
        .status(401)
        .send({ message: "User with this Email Id does't exists" });
    }

    const otp = OTP();
    otpCache.set(user.email, otp);
    console.log(otpCache.get(user.email), otp);

    await sendMail({
      subject: "You OTP For URL Shortner",
      message: `Your OTP is: ${otp}`,
    });

    return res.status(201).send({
      message: `A 4 digit OTP has been sent to ${email}`,
    });
  } catch (error) {
    console.log(error.stack);
    return res.send(createError);
  }
};

module.exports = forgotPassword;
