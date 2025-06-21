const NodeCache = require("node-cache");
const winston = require("../utils/logger/logger");
const { server: debug } = require("../config/debug");

/**
 * Cache configuration options
 * stdTTL: Time to live in seconds for cache entries (200 seconds)
 * checkperiod: How often to check for expired entries (600 seconds)
 * maxKeys: Maximum number of keys in cache (100)
 * useClones: Deep clone data when storing/retrieving (false for better performance)
 * deleteOnExpire: Whether to delete expired entries on check (true)
 */
const cacheOptions = {
  stdTTL: 200,
  checkperiod: 600,
  maxKeys: 100,
  useClones: false,
  deleteOnExpire: true,
  errorOnMissing: false,
};

/**
 * Create cache instance with error handling and monitoring
 */
const urlCache = new NodeCache(cacheOptions);

// Setup error handling
urlCache.on("error", (err) => {
  winston.error(`Cache error: ${err.message}`);
  debug(`Cache error details: ${err.stack}`);
});

// Monitor cache statistics
urlCache.on("expired", (key, value) => {
  debug(`Cache entry expired - Key: ${key}`);
});

urlCache.on("del", (key, value) => {
  debug(`Cache entry deleted - Key: ${key}`);
});

urlCache.on("flush", () => {
  debug("Cache flushed");
});

/**
 * Enhanced cache wrapper with error handling and monitoring
 */
const enhancedCache = {
  /**
   * Set value in cache with error handling
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} [ttl] - Time to live in seconds (optional)
   * @returns {boolean} - Success status
   */
  set(key, value, ttl = undefined) {
    try {
      const success = urlCache.set(key, value, ttl);
      if (!success) {
        winston.warn(`Failed to set cache key: ${key}`);
      }
      return success;
    } catch (err) {
      winston.error(`Error setting cache key ${key}: ${err.message}`);
      return false;
    }
  },

  /**
   * Get value from cache with error handling
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found
   */
  get(key) {
    try {
      const value = urlCache.get(key);
      if (value === undefined) {
        debug(`Cache miss for key: ${key}`);
        return null;
      }
      return value;
    } catch (err) {
      winston.error(`Error getting cache key ${key}: ${err.message}`);
      return null;
    }
  },

  /**
   * Delete value from cache with error handling
   * @param {string} key - Cache key
   * @returns {boolean} - Success status
   */
  del(key) {
    try {
      return urlCache.del(key) > 0;
    } catch (err) {
      winston.error(`Error deleting cache key ${key}: ${err.message}`);
      return false;
    }
  },

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      keys: urlCache.keys().length,
      hits: urlCache.getStats().hits,
      misses: urlCache.getStats().misses,
      ksize: urlCache.getStats().ksize,
      vsize: urlCache.getStats().vsize,
    };
  },

  /**
   * Clear all cache entries
   * @returns {boolean} Success status
   */
  flush() {
    try {
      urlCache.flushAll();
      return true;
    } catch (err) {
      winston.error(`Error flushing cache: ${err.message}`);
      return false;
    }
  },
};

module.exports = enhancedCache;
