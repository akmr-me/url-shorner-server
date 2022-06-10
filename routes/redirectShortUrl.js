const router = require("express").Router();
const createError = require("http-errors");
const urlCache = require("../DB/nodeCache");
const ShortURL = require("../models/urlModel");

router.get("/:shortUrl", async (req, res, next) => {
  const shortUrl = req.params.shortUrl;
  // console.table(urlCache.getStats());
  // if (urlCache.has(shortUrl)) {
  //   console.log("cache response");
  //   return res.redirect(urlCache.get(shortUrl));
  // }
  const cacheUrl = urlCache.get(shortUrl);
  if (cacheUrl) {
    console.log("cache response");
    return res.redirect(cacheUrl);
  }
  console.log("redirect short url");
  const doc = await ShortURL.findOne({ short: shortUrl });
  if (doc === null) return next(createError(404, "Invalide URL request"));
  doc.clicks++;
  doc.lastClicked = Date.now();
  doc.save();
  //   console.log()
  //res.redirect must have http:// else it will redirect to locahost/fullurl
  res.redirect(doc.fullUrl);
});

module.exports = router;
