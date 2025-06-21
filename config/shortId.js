const { customAlphabet: secureAlphabet } = require("nanoid");
const { customAlphabet: nonSecureAlphabet } = require("nanoid/non-secure");
const config = require("./index");

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Short ID configuration
 */
const ID_CONFIG = {
  length: parseInt(process.env.SHORT_URL_LENGTH || "8", 10),
  secure: process.env.USE_SECURE_IDS === "true",
  alphabet: BASE58,
};

// Validate configuration
if (ID_CONFIG.length < 6) {
  throw new Error(
    "Short URL length must be at least 6 characters for security"
  );
}

/**
 * Calculate collision probability for given length
 * @param {number} length - ID length
 * @param {number} numberOfIds - Number of IDs to generate
 * @returns {number} Collision probability
 */
const calculateCollisionProbability = (length, numberOfIds) => {
  const alphabetLength = BASE58.length;
  const possibilities = Math.pow(alphabetLength, length);
  return 1 - Math.exp((-numberOfIds * (numberOfIds - 1)) / (2 * possibilities));
};

// Log collision probability for 1 million URLs
const probability = calculateCollisionProbability(ID_CONFIG.length, 1000000);
if (probability > 0.001) {
  console.warn(
    `Warning: Current ID length has a ${(probability * 100).toFixed(
      4
    )}% chance of collision with 1M URLs`
  );
}

// Create ID generator based on configuration
const generateId = ID_CONFIG.secure
  ? secureAlphabet(ID_CONFIG.alphabet, ID_CONFIG.length)
  : nonSecureAlphabet(ID_CONFIG.alphabet, ID_CONFIG.length);

/**
 * Generate a unique short ID
 * @returns {string} Generated short ID
 */
const generateShortId = () => {
  const id = generateId();
  return id;
};

module.exports = generateShortId;
