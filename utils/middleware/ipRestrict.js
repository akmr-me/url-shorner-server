const restrictCache = require("../../DB/restrictCache");
const logger = require("../logger/logger");

const ipRestrict = async (req, res, next) => {
  try {
    if (!restrictCache.has(req.ip)) {
      restrictCache.set(req.ip, 0);
      next();
    } else {
      console.log(restrictCache.get(req.ip));
      let count = await restrictCache.get(req.ip);
      count++;
      console.log(restrictCache.keys());
      console.log(count + "count");
      if (count > 5000) {
        const ttl = restrictCache.getTtl(req.ip);
        const now = Date.now();
        const waitTime = ((ttl - now) / (1000 * 60)) | 0;
        return res
          .status(429)
          .send(
            `Max Limit is 5 URLs for free acount wait until ::> ${waitTime}`
          );
      }
      restrictCache.set(req.ip, count);
      next();
    }
  } catch (error) {
    logger.error(error.message);
  }
};

module.exports = ipRestrict;
