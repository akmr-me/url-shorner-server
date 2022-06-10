//non-secure is unsafe but faster
const { customAlphabet } = require("nanoid/non-secure");
const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const nanoid = customAlphabet(base58, 8);

module.exports = nanoid;
