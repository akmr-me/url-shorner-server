const authenticateUser = require("../controller/authenticatUser");

const router = require("express").Router();

router.get("/", authenticateUser, (req, res, next) => {
  if (req.email) {
    console.log("it worked");
    res.sendStatus(204);
  } else {
    next();
  }
});

module.exports = router;
