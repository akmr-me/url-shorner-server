const otpCache = require("../../DB/otpCache");
const User = require("../../models/userModel");
const bcrypt = require("bcrypt");

const generatePassword = async (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const password = req.body.password;

  console.log(otp, email, password);
  console.log(otpCache.keys());

  const tempOtp = await otpCache.get(email.toLowerCase());
  if (tempOtp == otp) {
    console.log("tempOtp", tempOtp);
    const HashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email: email },
      { password: HashPassword }
    );
    if (user.email) {
      return res
        .status(201)
        .json({ message: "password Updatd successfully", email: user.email });
    }
    console.log("updaated Password", user);
  } else {
    return res.status(401).json({ message: "Some error occured/ Wrong OTP" });
  }
};
module.exports = generatePassword;
