const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
      index: true,
    },
    name: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    guestId: {
      type: String,
      sparse: true,
      index: true,
    },
    googleAuth: {
      iss: String,
      azp: String,
      aud: String,
      sub: {
        type: String,
        sparse: true,
        index: true,
      },
      email_verified: Boolean,
      nbf: Number,
      picture: String,
      given_name: String,
      family_name: String,
      iat: Number,
      exp: Number,
      jti: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !!this.email && !this.googleAuth;
      },
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function (password) {
          // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
          return (
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
              password
            ) || !!this.googleAuth
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockUntil: {
      type: Date,
      default: null,
    },
    profile: {
      avatar: String,
      timezone: String,
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Index for faster queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ guestId: 1, status: 1 });

// Password hashing middleware and email normalization
userSchema.pre("save", async function (next) {
  // Normalize email
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }

  // Hash password if modified
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAccountLocked = function () {
  return this.accountLockUntil && this.accountLockUntil > new Date();
};

userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.accountLockUntil && this.accountLockUntil < new Date()) {
    return this.updateOne({
      $set: {
        failedLoginAttempts: 1,
      },
      $unset: { accountLockUntil: 1 },
    });
  }

  // Otherwise increment
  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account if we've reached max attempts and haven't locked it yet
  if (this.failedLoginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = {
      accountLockUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
    };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { accountLockUntil: 1 },
  });
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  if (!email) return null;
  return this.findOne({
    email: email.toLowerCase().trim(),
    status: { $ne: "suspended" },
  });
};

userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({
    "googleAuth.sub": googleId,
    status: { $ne: "suspended" },
  });
};

// Add a new method to normalize email
userSchema.statics.normalizeEmail = function (email) {
  return email ? email.toLowerCase().trim() : null;
};

userSchema.statics.passwordValidator = function (password) {
  const errors = [];
  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
// Clean sensitive data before sending to client
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.failedLoginAttempts;
  delete obj.accountLockUntil;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
