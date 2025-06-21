const mongoose = require("mongoose");
const shortid = require("../config/shortId");
const { isValidUrl } = require("../utils/is_url");

const urlSchema = new mongoose.Schema(
  {
    fullUrl: {
      type: String,
      required: [true, "Full URL is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return isValidUrl(v);
        },
        message: "Invalid URL format",
      },
    },
    short: {
      type: String,
      required: [true, "Short URL is required"],
      unique: true,
      minlength: [4, "Short URL must be at least 4 characters"],
      maxlength: [12, "Short URL cannot exceed 12 characters"],
      default: function () {
        return shortid();
      },
      index: true, // Index for faster lookups
    },
    clicks: {
      required: true,
      type: Number,
      default: 0,
      min: [0, "Clicks cannot be negative"],
    },
    lastClicked: {
      type: Number,
      default: Date.now,
      required: true,
      index: true, // Index for sorting by last click
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Index for user lookups
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by creation date
    },
    guestId: {
      type: String,
      trim: true,
      index: true, // Index for guest lookups
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      index: true, // Index for expiration checks
    },
    metadata: {
      title: String,
      description: String,
      thumbnail: String,
    },
    analytics: {
      countries: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      referrers: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      browsers: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
      devices: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
    },
    customDomain: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds updatedAt timestamp
    strict: true,
    toJSON: { virtuals: true }, // Enable virtuals in JSON
    toObject: { virtuals: true }, // Enable virtuals in Object
  }
);

// Virtual populate for user data
urlSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Compound indexes for efficient queries
urlSchema.index({ userId: 1, createdAt: -1 }); // User's URLs by date
urlSchema.index({ status: 1, expiresAt: 1 }); // Expiration checking

// URL normalization and validation middleware
urlSchema.pre("save", async function (next) {
  if (this.isModified("fullUrl")) {
    // Normalize URL
    let url = this.fullUrl.trim();
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }
    this.fullUrl = url;

    // Validate URL
    if (!isValidUrl(url)) {
      next(new Error("Invalid URL format"));
      return;
    }
  }

  // Check expiration
  if (this.expiresAt && this.expiresAt < new Date()) {
    next(new Error("Expiration date must be in the future"));
    return;
  }

  next();
});

// Instance methods
urlSchema.methods.incrementClicks = async function (analyticsData = {}) {
  this.clicks += 1;
  this.lastClicked = Date.now();

  // Update analytics if provided
  if (analyticsData.country) {
    const currentCount =
      this.analytics.countries.get(analyticsData.country) || 0;
    this.analytics.countries.set(analyticsData.country, currentCount + 1);
  }
  if (analyticsData.referrer) {
    const currentCount =
      this.analytics.referrers.get(analyticsData.referrer) || 0;
    this.analytics.referrers.set(analyticsData.referrer, currentCount + 1);
  }
  if (analyticsData.browser) {
    const currentCount =
      this.analytics.browsers.get(analyticsData.browser) || 0;
    this.analytics.browsers.set(analyticsData.browser, currentCount + 1);
  }
  if (analyticsData.device) {
    const currentCount = this.analytics.devices.get(analyticsData.device) || 0;
    this.analytics.devices.set(analyticsData.device, currentCount + 1);
  }

  return this.save();
};

// Static methods
urlSchema.statics.findByShort = function (shortUrl) {
  return this.findOne({ short: shortUrl, status: "active" });
};

urlSchema.statics.findByShortWithUser = function (shortUrl) {
  return this.findOne({ short: shortUrl, status: "active" }).populate(
    "user",
    "name email profile.avatar"
  );
};

urlSchema.statics.findUserUrls = function (userId, options = {}) {
  const query = this.find({ userId })
    .sort({ createdAt: -1 })
    .populate("user", "name email profile.avatar");

  if (options.limit) {
    query.limit(options.limit);
  }
  if (options.skip) {
    query.skip(options.skip);
  }

  return query;
};

urlSchema.statics.getAnalytics = async function (userId) {
  const analytics = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        status: "active",
      },
    },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: "$clicks" },
        totalUrls: { $sum: 1 },
        avgClicksPerUrl: { $avg: "$clicks" },
        mostClicked: { $max: "$clicks" },
        lastCreated: { $max: "$createdAt" },
        domains: {
          $addToSet: {
            $regexExtract: {
              input: "$fullUrl",
              regex: /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/i,
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: userId },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              name: 1,
              email: 1,
              "profile.avatar": 1,
            },
          },
        ],
        as: "user",
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
  ]);

  return (
    analytics[0] || {
      totalClicks: 0,
      totalUrls: 0,
      avgClicksPerUrl: 0,
      mostClicked: 0,
      domains: [],
      user: null,
    }
  );
};

// Helper method to get URL with user data
urlSchema.methods.withUser = function () {
  return this.populate("user", "name email profile.avatar");
};

const ShortURL = mongoose.model("ShortURL", urlSchema);

module.exports = ShortURL;
