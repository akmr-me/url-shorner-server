const NodeCache = require("node-cache");

const restrictCache = new NodeCache({ stdTTL: 3600, checkperiod: 60 });

module.exports = restrictCache;
