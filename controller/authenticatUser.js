const jwt = require("jsonwebtoken");
const config = require("../config/index");

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("authentcation");

  if (token == null) {
    // Remember me Case
    // if (req.headers["cookie"]) {
    //   const token = req.headers['cookie'].split("=")[1]
    //   jwt.verify(token, config.jwt.refreshToken, (err, email))
    //   console.log("Has cookie", req.headers["cookie"]);
    // }
    console.log("no token");
    next();
    return;
  }

  jwt.verify(token, config.jwt.accessToken, (err, email) => {
    if (err) {
      console.log(err.message);
      //TODO:  this message is for Development only the error part
      res.status(403).json({ error: "token expired" });
      return;
    }
    console.log("Authenticated user");
    // If a User with account
    req.user = email;
    next();
  });
};

module.exports = authenticateUser;
