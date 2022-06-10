const router = require("express").Router();
const register = require("../../controller/auth/registerController");

router.post("/", register);

module.exports = router;
