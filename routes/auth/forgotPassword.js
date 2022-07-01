const forgotPassword = require("../../controller/auth/forgotPassword");
const { otpLimiter } = require("../../controller/rateLimiter/rateLimiter");

const router = require("express").Router();

router.post("/", otpLimiter, forgotPassword);

module.exports = router;
