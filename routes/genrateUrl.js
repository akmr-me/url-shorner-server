var express = require("express");
const router = express.Router();
// const urlCache = require("../DB/nodeCache");
const ShortURL = require("../models/urlModel");
const { is_url, checkDns } = require("../utils/is_url");
const logger = require("../utils/logger/logger");
const User = require("../models/userModel");

router.post("/", async (req, res, next) => {
  const fullURL = req.body.fullURL;

  if (!is_url(fullURL))
    return res.status(400).send("Given URL is not a valid URL");

  let dnsStatus = await checkDns(fullURL);
  if (!dnsStatus) return res.status(400).send("Invalid DNS of givent URL");
  // Use try catch to check for common value for short url it will throw a error
  try {
    const result = await ShortURL.create({
      fullUrl: fullURL,
    });
    // Set cache for new URL later give newUrl a bigger ttl
    // Check whether last mongo document are fast in retrival
    // urlCache.set(result.short, result.fullUrl);
    // If Req has user/email
    if (req.user) {
      const user = await User.findOne({ email: req.user.email });
      var count = await user.urls.push(result.short);
      await user.save();
    }
    //send response to user
    res.status(201).send({
      id: count || -1,
      short: result.short,
      full: result.fullUrl,
      clicks: result.clicks,
      lastClicked: result.lastClicked,
    });
  } catch (error) {
    // In Case if nanoid generate common short
    // This is a wrong Practice
    if (error.code === 11000 && error.name === "MongoServerError") {
      await ShortURL.create({ fullUrl: fullURL });
      return;
    }
    return res.status(500).send("Some Error Occured");
  }
});

module.exports = router;
