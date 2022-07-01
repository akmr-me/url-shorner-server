const mongoose = require("mongoose");
const shortid = require("../config/shortId");
//TODOS: use nano id for genrating shorurl specially non secure one it is faster
//       use static pre of schema function to check wether it is unique or not
//       if possible use base 58 and leave character that looks similar nanoid("adfna",10)

const urlSchema = new mongoose.Schema({
  fullUrl: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return shortid();
    },
  },
  clicks: {
    required: true,
    type: Number,
    default: 0,
  },
  lastClicked: {
    type: Number,
    default: Date.now,
    required: true,
  },
});

urlSchema.pre("save", function (next) {
  //we can check for http:// is appended or not in redirectShortUrl router(this will save few bytes in DB) or we can use schema.post also
  if (this.clicks === 0) {
    if (!this.fullUrl.includes("http")) {
      this.fullUrl = `https://${this.fullUrl}`;
    }
  }
  next();
});

module.exports = mongoose.model("ShortURL", urlSchema);
