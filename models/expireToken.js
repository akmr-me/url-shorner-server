const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      trim: true,
      index: true,
      minlength: [32, "Token must be at least 32 characters long"],
      maxlength: [512, "Token exceeds maximum length"],
    },
    expiresAt: {
      type: Number,
      required: [true, "Expiration time is required"],
      validate: {
        validator: function (v) {
          return v > Date.now() / 1000;
        },
        message: "Expiration time must be in the future",
      },
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      length: 64,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    systemId: {
      type: String,
      trim: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsed: {
      type: Date,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
    tokenType: {
      type: String,
      required: true,
      enum: ["refresh", "reset", "verification", "access"],
    },
    clientInfo: {
      userAgent: { type: String },
      ip: { type: String },
    },
  },
  {
    timestamps: true,
    collection: "tokens",
    strict: true,
  }
);

// Compound index for token lookups
tokenSchema.index({ userId: 1, tokenType: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save middleware to ensure expiresAt is in seconds
tokenSchema.pre("save", function (next) {
  if (this.isModified("expiresAt") && this.expiresAt < 1000000000000) {
    // If expiresAt is in seconds, it should be less than year 2286
    next();
  } else if (this.isModified("expiresAt")) {
    // Convert milliseconds to seconds if needed
    this.expiresAt = Math.floor(this.expiresAt / 1000);
  }
  next();
});

// Instance method to check if token is expired
tokenSchema.methods.isExpired = function () {
  return this.expiresAt < Date.now() / 1000;
};

// Instance method to revoke token
tokenSchema.methods.revoke = function () {
  this.isRevoked = true;
  this.revokedAt = new Date();
  return this.save();
};

// Static method to cleanup expired tokens
tokenSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [{ expiresAt: { $lt: Date.now() / 1000 } }, { isRevoked: true }],
  });
};

// Create model
const TokenSchema = mongoose.model("TokenSchema", tokenSchema);

module.exports = TokenSchema;
