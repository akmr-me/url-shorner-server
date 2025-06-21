const bcrypt = require("bcrypt");
const User = require("../../models/userModel");
const winston = require("../../utils/logger/logger");
const { setAuthCookies } = require("../../utils/auth/register");

const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send("Invalid credentials. Please register");
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).send("Invalid credentials");
    }

    await setAuthCookies(res, user.email);

    return res.status(200).json({
      message: `Welcome back ${user.email}`,
      email: user.email,
      // rememberMe,
    });
  } catch (error) {
    winston.error(error.stack);
    return res.status(500).send("An error occurred");
  }
};

module.exports = login;
