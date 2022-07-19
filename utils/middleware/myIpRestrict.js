const ipRestrictClosure = () => {
  const ip = {};
  function ipRestrict(req, res, next) {
    console.log("ran ipRestrict");
    if (!(req.ip in ip)) {
      ip[req.ip] = 1;
      next();
    } else {
      ip[req.ip]++;
      console.table(ip);
      if (ip[req.ip] > 5) {
        return res.status(429).send("Max Limit of URL shortning Exceeded");
      }
      next();
    }
  }
  return ipRestrict;
};

// module.exports = ipRestrictClosure();
