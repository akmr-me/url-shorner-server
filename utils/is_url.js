const dns = require("dns");
const util = require("util");
const winston = require("./logger/logger");
const lookup = util.promisify(dns.lookup);
function is_url(str) {
  const regexp =
    /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  if (regexp.test(str)) {
    return true;
  } else {
    return false;
  }
}
async function checkDns(strURL) {
  //url as String
  let str;
  let status;
  if (strURL.includes("http")) {
    str = strURL;
  } else {
    str = "https://" + strURL;
  }
  const host = new URL(str).host;
  const options = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };
  try {
    const { address } = await lookup(host, options);
    if (address) return true;
  } catch (error) {
    winston.error(error.stack);
    return false;
  }
  return false;
}
module.exports = { is_url, checkDns };
