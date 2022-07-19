const router = require("express").Router();
// const urlCache = require("../DB/nodeCache");
const ShortURL = require("../models/urlModel");

router.get("/:shortUrl", async (req, res, next) => {
  const shortUrl = req.params.shortUrl;
  // const cacheUrl = urlCache.get(shortUrl);
  // if (cacheUrl) {
  //   console.log("cache response");
  //   return res.redirect(cacheUrl);
  // }//was slower than mongodb

  const doc = await ShortURL.findOne({ short: shortUrl });
  if (doc === null) return res.status(404).send("Invalide URL request");
  doc.clicks++;
  doc.lastClicked = Date.now();
  doc.save();
  //res.redirect must have http:// else it will redirect to locahost/fullurl
  return res.redirect(doc.fullUrl);
});

module.exports = router;
