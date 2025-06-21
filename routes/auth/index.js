const { Router } = require("express");
const {
  loginLimiter,
  otpLimiter,
} = require("../../controller/rateLimiter/rateLimiter");

const router = Router();

// Authentication routes
router.post("/generate-otp", require("../../controller/auth/generateOtp"));
router.post("/register", require("../../controller/auth/registerController"));
router.post(
  "/login",
  loginLimiter,
  require("../../controller/auth/loginController")
);
router.get("/refresh", require("../../controller/auth/refreshController"));
router.post(
  "/forgot-password",
  require("../../controller/auth/forgotPassword")
);
router.post("/otp", otpLimiter, require("../../controller/auth/otpController"));
router.post("/verify-otp", require("../../controller/auth/verifyOtp"));
router.post(
  "/reset-password",
  require("../../controller/auth/generatePassword")
);
router.post("/logout", require("../../controller/auth/logout"));
// Guest ID route
router.post("/set-guest-id", require("../../controller/auth/setGuestId"));

// OAuth routes
router.post("/google", require("../../controller/auth/googleOAuth"));
// router.get("/google/callback", require("./googleOAuth/callback"));

//turnstile
router.post("/turnstile", require("../../controller/auth/turnstileController"));

module.exports = router;
