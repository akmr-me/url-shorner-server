const jwt = require("jsonwebtoken");
const config = require("../../config");
const ExpireToken = require("../../models/expireToken");
const { genAccessToken } = require("../../utils/token");
const User = require("../../models/userModel");
const getURL = require("../getURL");

const refreshController = async (req, res, next) => {
  if (!req.headers["cookie"])
    return res.status(401).send({ message: "Please Login Again" });
  const refreshToken = req.headers["cookie"].split("=")[1];

  const tokenStatus = await ExpireToken.findOne({ token: refreshToken });
  // console.log("TokenStatus: ", tokenStatus, refreshToken);
  // Cookies are send automatically

  if (refreshToken && !tokenStatus) {
    jwt.verify(refreshToken, config.jwt.refreshToken, async (err, user) => {
      if (err) {
        // Wrong refresh tokenn
        // console.log(err.message);
        return res.status(406).json({ message: "Unauthorized" });
      }
      console.log(user, "user JWT");
      const accessToken = genAccessToken(user.email);
      const userData = await User.findOne({ email: user.email });
      const urls = await getURL(userData.urls, userData.email);
      return res.send({ accessToken, email: user.email, data: { urls: urls } });
    });
  } else {
    console.log("no refresh token");
    return res.status(406).json({ message: "Unauthorized" });
  }
};

module.exports = refreshController;
