const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const getURL = require("../getURL");
const { genRefreshToken, genAccessToken } = require("../../utils/token");

const login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const urls = req.body.urls;
  console.log("URLS: ", urls);

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).send("Invalid credential Please register");
    }

    // Check whether password match or not with hashed one in DB
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      // Create jwt access token
      const accessToken = genAccessToken(user.email);
      const refreshToken = genRefreshToken(user.email);
      const newURLs = [...new Set([...user.urls, ...urls])];
      user.urls = newURLs;
      user.save();
      // Set cookie with refreshToken
      res.cookie("token", refreshToken, {
        maxAge: 1000 * 60 * 24,
        httpOnly: false,
      });
      const allUrl = await getURL(newURLs, user.email);

      return res.status(200).json({
        message: `Welcome back ${user.email}`,
        accessToken,
        email: user.email,
        data: {
          urls: allUrl,
        },
      });
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.log(error + "from login controler");
    // return next(createError);
    return;
  }
};

module.exports = login;
