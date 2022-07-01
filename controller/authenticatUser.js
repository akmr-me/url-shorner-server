const jwt = require("jsonwebtoken");
const config = require("../config/index");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const userToken = authHeader && authHeader.split(" ")[1];

  console.log("authentcation");

  if (userToken == null) {
    // Remember me Case
    console.log("no token");
    next();
    return;
  }

  jwt.verify(userToken, config.jwt.accessToken, (err, email) => {
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
