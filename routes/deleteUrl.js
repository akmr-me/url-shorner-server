const router = require("express").Router();
const URL = require("../models/urlModel");
const winston = require("../utils/logger/logger");

router.delete("/:short", async (req, res, next) => {
  const deleteReq = req.params.short;

  try {
    const { deletedCount } = await URL.deleteOne({ short: deleteReq });
    if (deletedCount == 1) {
      return res.sendStatus(204);
    } else {
      return res.status(400).send("Wrong Info");
    }
  } catch (error) {
    winston.error(error.stack);
  }
  return res.status(500).send("Some Error Occured");
});

module.exports = router;
