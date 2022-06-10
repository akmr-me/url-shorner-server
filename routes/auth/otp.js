const otpController = require("../../controller/auth/otpController");

const router = require("express").Router();

router.post("/", otpController);

module.exports = router;
