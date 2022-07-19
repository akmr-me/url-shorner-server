const authenticateUser = require("../controller/authenticatUser");

const router = require("express").Router();

router.get("/", authenticateUser, (req, res, next) => {
  if (req.email) {
    res.sendStatus(204);
  } else {
    next();
  }
});

module.exports = router;
