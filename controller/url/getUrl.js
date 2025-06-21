const getUrls = require("../../services/getUrls");
const winston = require("../../utils/logger/logger");
const USER = require("../../models/userModel");

const getUrl = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const status = "active";
  let userId;
  let guestId = req.guestId;

  if (req.email) {
    const user = await USER.findOne({ email: req.email });
    userId = user._id;
  }

  if (!guestId && !userId) {
    return res.status(400).send("No User Found");
  }
  try {
    const response = await getUrls({
      ...(userId ? { userId } : { guestId }),
      status,
      page,
      limit,
    });
    return res.status(200).json(response);
  } catch (error) {
    winston.error(error.stack);
    return res.status(500).send("Some Error Occurred");
  }
};

module.exports = getUrl;
