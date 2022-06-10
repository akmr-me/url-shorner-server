const NodeCache = require("node-cache");

const otpCache = new NodeCache({ stdTTL: 600, checkperiod: 600, maxKeys: 100 });

module.exports = otpCache;
