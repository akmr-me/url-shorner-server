const router = require("express").Router();
const login = require("../../controller/auth/loginController");

router.post("/", login);

module.exports = router;
