const otpCache = require("../../DB/otpCache");

const otpController = (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const tempCache = otpCache.get(email);
  console.log(email, otp, tempCache);
  if (otp != tempCache) {
    return res.status(401).send({ message: "Invalid OTP" });
  } else {
    return res.sendStatus(204);
  }
};
module.exports = otpController;
