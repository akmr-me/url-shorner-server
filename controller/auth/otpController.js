const otpCache = require("../../DB/otpCache");

const otpController = (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const tempCache = otpCache.get(email);
  if (otp != tempCache) {
    return res.status(401).send("Invalid OTP");
  } else {
    return res.sendStatus(204);
  }
};
module.exports = otpController;
