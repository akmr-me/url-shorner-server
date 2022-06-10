const router = require("express").Router();
const createError = require("http-errors");
const URL = require("../models/urlModel");

router.delete("/:short", async (req, res, next) => {
  const deleteReq = req.params.short;
  console.log("delete ", req.params.short);
  try {
    const { deletedCount } = await URL.deleteOne({ short: deleteReq });
    console.log(deletedCount);
    if (deletedCount == 1) {
      return res.sendStatus(204);
    } else {
      console.log("not deleted");
    }
  } catch (error) {
    console.log(error);
  }
  return res.send(createError);
});

module.exports = router;
