const forgotPassword = require("../../controller/auth/forgotPassword");

const router = require("express").Router();

router.post("/", forgotPassword);

module.exports = router;
