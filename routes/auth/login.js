const router = require("express").Router();
const login = require("../../controller/auth/loginController");
const { loginLimiter } = require("../../controller/rateLimiter/rateLimiter");

router.post("/", loginLimiter, login);

module.exports = router;
