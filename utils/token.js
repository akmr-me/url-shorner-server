const jwt = require("jsonwebtoken");
const config = require("../config");

const genAccessToken = (data) => {
  let access = jwt.sign({ email: data }, config.jwt.accessToken, {
    expiresIn: "30s",
  });
  // console.log(access);
  return access;
};
const genRefreshToken = (data) => {
  let refresh = jwt.sign({ email: data }, config.jwt.refreshToken, {
    expiresIn: "30m",
  });
  // console.log("Refresh: ", refresh);
  return refresh;
};

module.exports = {
  genAccessToken,
  genRefreshToken,
};
