const NodeCache = require("node-cache");

const urlCache = new NodeCache({ stdTTL: 200, checkperiod: 600, maxKeys: 100 });

module.exports = urlCache;
