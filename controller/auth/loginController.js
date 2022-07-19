const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const getURL = require("../getURL");
const { genRefreshToken, genAccessToken } = require("../../utils/token");
const winston = require("../../utils/logger/logger");

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const urls = req.body.urls;
  const rememberMe = req.body.rememberMe;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send("Invalid credential Please register");
    }

    // Check whether password match or not with hashed one in DB
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      const accessToken = genAccessToken(user.email);
      const refreshToken = rememberMe && genRefreshToken(user.email);
      const newURLs = [...new Set([...user.urls, ...urls])];
      user.urls = newURLs;
      user.save();

      if (rememberMe) {
        res.cookie("token", refreshToken, {
          maxAge: 1000 * 60 * 24,
          httpOnly: true,
          secure: true,
        });
      }
      const allUrl = await getURL(newURLs, user.email);

      return res.status(200).json({
        message: `Welcome back ${user.email}`,
        accessToken,
        email: user.email,
        rememberMe: rememberMe,
        data: {
          urls: allUrl,
        },
      });
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    winston.error(error.stack);
    res.status(500).send("Some Error Occured");
    return;
  }
};

module.exports = login;
