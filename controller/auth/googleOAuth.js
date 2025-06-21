const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("../../models/userModel");
const logger = require("../../utils/logger/logger");
const { setAuthCookies } = require("../../utils/auth/register");
const { migrateGuestUrls } = require("../../utils/url/migrateGuestUrls");

const client = new OAuth2Client(
  config.auth.google.clientId,
  config.auth.google.clientSecret,
  "postmessage"
);
const getTokenFromCode = async (code) => {
  try {
    const token = await client.getToken(code);
    const idToken = token.tokens.id_token;
    return idToken;
  } catch (error) {
    logger.error("Error getting token from Google code", error);
  }
};
const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.auth.google.clientId,
  });

  const payload = ticket.getPayload();

  if (
    payload.iss !== "https://accounts.google.com" ||
    payload.aud !== config.auth.google.clientId ||
    !payload.email_verified ||
    Date.now() >= payload.exp * 1000
  ) {
    throw new Error("Invalid Google ID Token");
  }

  return payload;
};

const googleOAuthLogin = async (req, res) => {
  try {
    const { credential, code } = req.body;
    if (!credential && !code) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    const payload = await verifyGoogleToken(
      credential ? credential : await getTokenFromCode(code)
    );
    logger.debug("Google auth payload received", { email: payload.email });

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user
      user = new User({
        email: payload.email,
        name: payload.name,
        googleAuth: {
          iss: payload.iss,
          azp: payload.azp,
          aud: payload.aud,
          sub: payload.sub,
          email_verified: payload.email_verified,
          nbf: payload.nbf,
          picture: payload.picture,
          given_name: payload.given_name,
          family_name: payload.family_name,
          iat: payload.iat,
          exp: payload.exp,
          jti: payload.jti,
        },
      });

      await user.save();
      logger.info("New Google user created", { userId: user._id });

      // Migrate guest URLs if any
      await migrateGuestUrls(req.cookies["guestId"], user._id);
    } else {
      // Verify existing user
      if (!user.googleAuth) {
        logger.warn("Email already in use without Google auth", {
          email: payload.email,
        });
        return res.status(400).json({
          error: "Email already in use with different authentication method",
        });
      }

      // Update Google auth data
      user.googleAuth = {
        iss: payload.iss,
        azp: payload.azp,
        aud: payload.aud,
        sub: payload.sub,
        email_verified: payload.email_verified,
        nbf: payload.nbf,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        iat: payload.iat,
        exp: payload.exp,
        jti: payload.jti,
      };
      await user.save();
    }

    // Set authentication cookies
    await setAuthCookies(res, payload.email);

    return res.status(200).json({
      message: `Welcome ${user.name || payload.email}!`,
      email: payload.email,
      name: user.name || payload.name,
      picture: payload.picture,
    });
  } catch (error) {
    logger.error("Google authentication failed:", error);

    if (error.message === "Invalid Google ID Token") {
      return res.status(401).json({ error: "Invalid Google credentials" });
    }

    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = googleOAuthLogin;
