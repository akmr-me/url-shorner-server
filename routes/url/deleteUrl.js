const router = require("express").Router();
const config = require("../../config");
const URL = require("../../models/urlModel");
const getUrls = require("../../services/getUrls");
const winston = require("../../utils/logger/logger");
const jwt = require("jsonwebtoken");

router.delete("/:short", async (req, res, next) => {});

module.exports = router;
