const config = require("../../config");
const setGuestId = require("./setGuestId");

const verifyTurnstile = (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  const verifyEndpoint =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  fetch(verifyEndpoint, {
    method: "POST",
    body: `secret=${encodeURIComponent(
      config.auth.turnstile.secretKey
    )}&response=${encodeURIComponent(token)}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        return setGuestId(req, res, next);
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ error: "Turnstile verification failed" });
      }
    })
    .catch((error) => {
      console.error("Error verifying Turnstile:", error);
      return res.status(500).json({ error: "Internal server error" });
    });
};

module.exports = verifyTurnstile;
