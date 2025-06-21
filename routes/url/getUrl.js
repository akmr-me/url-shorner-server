const router = require("express").Router();

router.get("/", require("../../controller/url/getUrl"));
