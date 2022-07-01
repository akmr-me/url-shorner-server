const otpCache = require("../../DB/otpCache");
const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const { genAccessToken, genRefreshToken } = require("../../utils/token");

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
      const accessToken = genAccessToken(email);
      const refreshToken = genRefreshToken(email);

      otpCache.del(email);

      res.cookie("token", refreshToken, {
        maxAge: 1000 * 60 * 24,
        httpOnly: false,
      });

      return res.status(201).json({
        message: `Password changed Successfully`,
        accessToken,
        email: user.email,
      });
    }
    console.log("updaated Password", user);
  } else {
    return res.status(401).json({ message: "Some error occured/ Wrong OTP" });
  }
};
module.exports = generatePassword;
