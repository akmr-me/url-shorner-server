const express = require("express");
const router = express.Router();
const ShortURL = require("../../models/urlModel");
const { isValidUrl, checkDns } = require("../../utils/is_url");
const logger = require("../../utils/logger/logger");
const User = require("../../models/userModel");
const config = require("../../config");

router.post("/", async (req, res) => {});

module.exports = router;
