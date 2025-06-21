const config = require("../../config");
const winston = require("../../utils/logger/logger");
const jwt = require("jsonwebtoken");

const setGuestId = async (req, res) => {
  const { guestId } = req.body;

  if (!guestId) {
    return res.status(400).json({
      status: "error",
      message: "Guest ID is required",
    });
  }

  try {
    const signedGuestId = jwt.sign({ guestId }, config.jwt.guestToken, {
      expiresIn: "1d",
    });

    res.cookie("guestId", signedGuestId, {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      status: "success",
      message: "Guest ID set successfully",
    });
  } catch (error) {
    winston.error("Error setting guest ID:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
    });
  }
};

module.exports = setGuestId;
