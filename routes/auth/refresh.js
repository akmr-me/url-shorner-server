const router = require("express").Router();
const refresh = require("../../controller/auth/refreshController");

router.get("/", refresh);

module.exports = router;
