const dns = require("dns");
const util = require("util");
const winston = require("./logger/logger");

// Convert dns.lookup to promise-based function
const lookup = util.promisify(dns.lookup);

// DNS lookup options
const DNS_OPTIONS = {
  family: 4,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

/**
 * URL validation regex pattern
 * Supports standard URL formats while excluding private IP ranges
 */
const URL_PATTERN =
  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;

/**
 * Validates if a string is a valid URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
const isValidUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    // Test against regex pattern
    if (!URL_PATTERN.test(url)) {
      return false;
    }

    // Additional validation using URL constructor
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch (error) {
    winston.debug("URL validation failed", {
      url,
      error: error.message,
    });
    return false;
  }
};

/**
 * Checks if a URL has valid DNS records
 * @param {string} url - URL to check
 * @returns {Promise<boolean>} True if DNS records exist
 */
const checkDns = async (url) => {
  if (!url) {
    winston.debug("URL is required for DNS check");
    return false;
  }

  try {
    // Ensure URL has protocol
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const host = new URL(normalizedUrl).host;

    // Perform DNS lookup
    const { address } = await lookup(host, DNS_OPTIONS);

    if (address) {
      winston.debug("DNS lookup successful", {
        host,
        address,
      });
      return true;
    }

    winston.debug("No DNS records found", { host });
    return false;
  } catch (error) {
    winston.warn("DNS lookup failed", {
      url,
      error: error.message,
    });
    return false;
  }
};

module.exports = {
  isValidUrl,
  checkDns,
};
