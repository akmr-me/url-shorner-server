const NodeCache = require("node-cache");
const winston = require("../utils/logger/logger");
const { server: debug } = require("../config/debug");

/**
 * OTP Cache configuration
 */
const otpCacheConfig = {
  stdTTL: 600, // 10 minutes
  checkperiod: 600,
  maxKeys: 100,
  useClones: false, // Important: Set to false to allow nested object modifications
  deleteOnExpire: true,
  errorOnMissing: false,
};

// Create OTP cache instance
const otpCache = new NodeCache(otpCacheConfig);

// Setup security monitoring and error handling
otpCache.on("error", (err) => {
  winston.error(`OTP Cache error: ${err.message}`);
  debug(`OTP Cache error details: ${err.stack}`);
});

otpCache.on("expired", (key, value) => {
  debug(`OTP expired for key: ${key}`);
  winston.info(`OTP expired for user identifier: ${key.split(":")[0]}`);
});

otpCache.on("del", (key, value) => {
  debug(`OTP deleted for key: ${key}`);
});

/**
 * Enhanced OTP cache wrapper with security features
 */
const enhancedOtpCache = {
  /**
   * Store OTP with additional security checks
   */
  storeOTP(identifier, otp, ttl = undefined) {
    try {
      const key = this._generateKey(identifier);
      const existingData = otpCache.get(key);

      // Check for existing attempts and rate limiting
      if (existingData?.metadata?.attempts >= 3) {
        winston.warn(`Multiple OTP requests for identifier: ${identifier}`);
        return {
          success: false,
          error: "Too many OTP requests",
          remainingTime: this._getRemainingTime(
            existingData.metadata.lastRequest
          ),
        };
      }

      // Store OTP with metadata
      const success = otpCache.set(
        key,
        {
          ...(otp || {}),
          metadata: {
            attempts: 0,
            created: Date.now(),
            lastRequest: Date.now(),
            requestCount: (existingData?.metadata?.requestCount || 0) + 1,
            ip: global.clientIP || "unknown", // If you're tracking client IP
            userAgent: global.userAgent || "unknown", // If you're tracking user agent
            history: [
              ...(existingData?.metadata?.history || []).slice(-4), // Keep last 5 attempts
              {
                timestamp: Date.now(),
                action: "generated",
                ip: global.clientIP || "unknown",
              },
            ],
          },
        },
        ttl
      );

      if (!success) {
        winston.error(`Failed to store OTP for identifier: ${identifier}`);
        return { success: false, error: "Cache storage failed" };
      }

      return { success: true };
    } catch (err) {
      winston.error(`Error storing OTP: ${err.message}`);
      return { success: false, error: "Internal error" };
    }
  },

  /**
   * Verify OTP with attempt tracking and security checks
   */
  verifyOTP(identifier, otp) {
    try {
      const key = this._generateKey(identifier);
      const data = otpCache.get(key);

      if (!data) {
        debug(`No OTP found for identifier: ${identifier}`);
        return { success: false, error: "OTP expired or not found" };
      }

      // Update attempts and history
      data.metadata.attempts += 1;
      data.metadata.lastAttempt = Date.now();
      data.metadata.history.push({
        timestamp: Date.now(),
        action: "verify_attempt",
        success: data.otp === otp,
        ip: global.clientIP || "unknown",
      });

      // Check max attempts
      if (data.metadata.attempts >= 3) {
        winston.warn(`Max OTP attempts reached for identifier: ${identifier}`);
        otpCache.del(key);
        return { success: false, error: "Max attempts reached" };
      }

      // Update cache with new metadata
      otpCache.set(key, data);

      // Verify OTP
      if (data.otp == otp) {
        // Log successful verification
        winston.info(`OTP verified successfully for: ${identifier}`);
        otpCache.del(key);
        return { success: true };
      }

      return {
        success: false,
        error: "Invalid OTP",
        remainingAttempts: 3 - data.metadata.attempts,
      };
    } catch (err) {
      winston.error(`Error verifying OTP: ${err.message}`);
      return { success: false, error: "Internal error" };
    }
  },

  /**
   * Get detailed OTP status and metadata
   */
  getOTPStatus(identifier) {
    try {
      const key = this._generateKey(identifier);
      const data = otpCache.get(key);

      if (!data) return null;

      return {
        attempts: data.metadata.attempts,
        created: data.metadata.created,
        lastAttempt: data.metadata.lastAttempt,
        requestCount: data.metadata.requestCount,
        history: data.metadata.history,
        ttl: otpCache.getTtl(key),
      };
    } catch (err) {
      winston.error(`Error getting OTP status: ${err.message}`);
      return null;
    }
  },

  /**
   * Clear OTP for an identifier
   * @param {string} identifier - User identifier
   * @returns {boolean} Success status
   */
  clearOTP(identifier) {
    try {
      const key = this._generateKey(identifier);
      return otpCache.del(key) > 0;
    } catch (err) {
      winston.error(`Error clearing OTP: ${err.message}`);
      return false;
    }
  },

  /**
   * Generate cache key with namespace
   * @private
   * @param {string} identifier - User identifier
   * @returns {string} Cache key
   */
  _generateKey(identifier) {
    return `otp:${identifier.toLowerCase()}`;
  },

  /**
   * Get cache statistics for monitoring
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      keys: otpCache.keys().length,
      hits: otpCache.getStats().hits,
      misses: otpCache.getStats().misses,
      ksize: otpCache.getStats().ksize,
      vsize: otpCache.getStats().vsize,
    };
  },

  /**
   * Calculate remaining time for rate limiting
   * @private
   */
  _getRemainingTime(lastRequestTime) {
    const cooldown = 15 * 60 * 1000; // 15 minutes
    const elapsed = Date.now() - lastRequestTime;
    return Math.max(0, cooldown - elapsed);
  },
};

module.exports = enhancedOtpCache;
