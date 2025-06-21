const config = require("../../config");
const { genAccessToken, genRefreshToken } = require("../token");
const Token = require("../../models/expireToken");

const setAuthCookies = async (res, email) => {
  const sessionId = require("crypto")
    .randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const accessToken = genAccessToken(email, sessionId);
  const refreshToken = genRefreshToken(email, sessionId);

  // Store refresh token
  await Token.create({
    sessionId,
    token: refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    tokenType: "refresh",
  });

  res.cookie("token", refreshToken, {
    maxAge: config.auth.cookie.refreshToken.maxAge,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.cookie("accessToken", accessToken, {
    maxAge: config.auth.cookie.accessToken.maxAge,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
};

module.exports = {
  setAuthCookies,
};
