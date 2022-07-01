const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Number, //time is in second
    required: true,
  },
});

module.exports = mongoose.model("TokenSchema", tokenSchema);
