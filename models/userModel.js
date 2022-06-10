const mongoose = require("mongoose");
const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const isEmail = (email) => {
  return emailRegEx.test(email);
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please Enter an Email"],
    validate: [isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: true,
  },
  urls: {
    type: Array,
  },
});

module.exports = mongoose.model("User", userSchema);
