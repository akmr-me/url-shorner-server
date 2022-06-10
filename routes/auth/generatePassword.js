const generatePassword = require("../../controller/auth/generatePassword");

const router = require("express").Router();

router.post("/", generatePassword);

module.exports = router;
