const jwt = require("jsonwebtoken");
const config = require("../../config");

const refreshController = (req, res, next) => {
  console.log(req.headers["cookie"]);
  if (!req.headers["cookie"])
    return res.status(401).send({ message: "Please Login Again" });
  const refreshToken = req.headers["cookie"].split("=")[1];

  // Cookies are send automatically
  // console.log("refresh", refreshToken);
  if (refreshToken) {
    jwt.verify(refreshToken, config.jwt.refreshToken, (err, user) => {
      if (err) {
        // Wrong refresh tokenn
        console.log(err.message);
        return res.status(406).json({ message: "Unauthorized" });
      }
      console.log(user, "user");
      const accessToken = jwt.sign(
        { email: user.email },
        config.jwt.accessToken,
        { expiresIn: "10m" }
      );
      return res.send({ accessToken, email: user.email });
    });
  } else {
    console.log("no refresh token");
    return res.status(406).json({ message: "Unauthorized" });
  }
};

module.exports = refreshController;
