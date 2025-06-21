const router = require("express").Router();

router.post("/", require("../../controller/auth/setGuestId"));

module.exports = router;
