const NodeCache = require("node-cache");
const winston = require("../utils/logger/logger");
const { server: debug } = require("../config/debug");

/**
 * Restriction Cache Configuration
 * stdTTL: 3600 seconds (1 hour) - Standard restriction period
 * checkperiod: 60 seconds - Check for expired restrictions every minute
 * maxKeys: 1000 - Prevent memory exhaustion
 * useClones: false - Better performance
 * deleteOnExpire: true - Remove expired restrictions automatically
 */
const restrictCacheConfig = {
  stdTTL: 3600,
  checkperiod: 60,
  maxKeys: 1000,
  useClones: false,
  deleteOnExpire: true,
  errorOnMissing: false,
};

// Create restriction cache instance
const restrictCache = new NodeCache(restrictCacheConfig);

// Setup monitoring and error handling
restrictCache.on("error", (err) => {
  winston.error(`Restriction Cache error: ${err.message}`);
  debug(`Restriction Cache error details: ${err.stack}`);
});

// Monitor restriction expirations
restrictCache.on("expired", (key, value) => {
  const [type, identifier] = key.split(":");
  debug(`Restriction expired - Type: ${type}, Identifier: ${identifier}`);
  winston.info(`Restriction lifted for ${type}: ${identifier}`);
});

// Monitor restriction deletions
restrictCache.on("del", (key, value) => {
  const [type, identifier] = key.split(":");
  debug(`Restriction deleted - Type: ${type}, Identifier: ${identifier}`);
});

/**
 * Enhanced restriction cache wrapper with security features
 */
const enhancedRestrictCache = {
  /**
   * Add a restriction
   * @param {string} type - Type of restriction (e.g., 'ip', 'user', 'endpoint')
   * @param {string} identifier - Identifier to restrict (e.g., IP address, user ID)
   * @param {Object} data - Restriction data (e.g., reason, count)
   * @param {number} [ttl] - Custom TTL in seconds
   * @returns {boolean} Success status
   */
  addRestriction(type, identifier, data, ttl = undefined) {
    try {
      const key = this._generateKey(type, identifier);
      const restrictionData = {
        ...data,
        timestamp: Date.now(),
        attempts:
          (this.getRestrictionData(type, identifier)?.attempts || 0) + 1,
      };

      const success = restrictCache.set(key, restrictionData, ttl);

      if (success) {
        winston.info(
          `Restriction added - Type: ${type}, Identifier: ${identifier}`
        );
        debug(`Restriction details: ${JSON.stringify(restrictionData)}`);
      }

      return success;
    } catch (err) {
      winston.error(`Error adding restriction: ${err.message}`);
      return false;
    }
  },

  /**
   * Check if an identifier is restricted
   * @param {string} type - Type of restriction
   * @param {string} identifier - Identifier to check
   * @returns {boolean} True if restricted
   */
  isRestricted(type, identifier) {
    try {
      const key = this._generateKey(type, identifier);
      return restrictCache.has(key);
    } catch (err) {
      winston.error(`Error checking restriction: ${err.message}`);
      return false;
    }
  },

  /**
   * Get restriction data
   * @param {string} type - Type of restriction
   * @param {string} identifier - Identifier to check
   * @returns {Object|null} Restriction data or null if not restricted
   */
  getRestrictionData(type, identifier) {
    try {
      const key = this._generateKey(type, identifier);
      return restrictCache.get(key) || null;
    } catch (err) {
      winston.error(`Error getting restriction data: ${err.message}`);
      return null;
    }
  },

  /**
   * Remove a restriction
   * @param {string} type - Type of restriction
   * @param {string} identifier - Identifier to unrestrict
   * @returns {boolean} Success status
   */
  removeRestriction(type, identifier) {
    try {
      const key = this._generateKey(type, identifier);
      const success = restrictCache.del(key) > 0;

      if (success) {
        winston.info(
          `Restriction removed - Type: ${type}, Identifier: ${identifier}`
        );
      }

      return success;
    } catch (err) {
      winston.error(`Error removing restriction: ${err.message}`);
      return false;
    }
  },

  /**
   * Get all restrictions of a specific type
   * @param {string} type - Type of restriction
   * @returns {Array} Array of restricted identifiers and their data
   */
  getRestrictionsByType(type) {
    try {
      const prefix = `${type}:`;
      return restrictCache
        .keys()
        .filter((key) => key.startsWith(prefix))
        .map((key) => ({
          identifier: key.slice(prefix.length),
          data: restrictCache.get(key),
        }));
    } catch (err) {
      winston.error(`Error getting restrictions by type: ${err.message}`);
      return [];
    }
  },

  /**
   * Clear all restrictions
   * @returns {boolean} Success status
   */
  clearAllRestrictions() {
    try {
      restrictCache.flushAll();
      winston.info("All restrictions cleared");
      return true;
    } catch (err) {
      winston.error(`Error clearing restrictions: ${err.message}`);
      return false;
    }
  },

  /**
   * Generate cache key with type namespace
   * @private
   * @param {string} type - Restriction type
   * @param {string} identifier - Identifier
   * @returns {string} Cache key
   */
  _generateKey(type, identifier) {
    return `${type}:${identifier}`.toLowerCase();
  },

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      keys: restrictCache.keys().length,
      hits: restrictCache.getStats().hits,
      misses: restrictCache.getStats().misses,
      ksize: restrictCache.getStats().ksize,
      vsize: restrictCache.getStats().vsize,
    };
  },
};

module.exports = enhancedRestrictCache;
