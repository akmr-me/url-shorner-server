const jwt = require("jsonwebtoken");
const config = require("../config");

const genAccessToken = (email, sessionId) => {
  return jwt.sign({ email, sessionId }, config.jwt.accessToken, {
    expiresIn: config.jwt.accessTokenExpiry || "2m",
  });
};

const genRefreshToken = (email, sessionId) => {
  return jwt.sign({ email, sessionId }, config.jwt.refreshToken, {
    expiresIn: config.jwt.refreshTokenExpiry || "24h",
  });
};

module.exports = {
  genAccessToken,
  genRefreshToken,
};
