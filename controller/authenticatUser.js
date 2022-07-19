const jwt = require("jsonwebtoken");
const config = require("../config/index");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const userToken = authHeader && authHeader.split(" ")[1];

  if (userToken == null) {
    next();
    return;
  }

  jwt.verify(userToken, config.jwt.accessToken, (err, email) => {
    if (err) {
      console.error("JWT", err.message);
      //TODO:  this message is for Development only the error part
      if (req.headers["cookie"])
        return res.status(403).send("Please Try Again");

      res.status(440).send("Session Expired. Please, Login Again");
      return;
    }
    console.log("Authenticated user");
    // If a User with account
    req.user = email;
    next();
  });
};

module.exports = authenticateUser;
