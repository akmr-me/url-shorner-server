const { Router } = require("express");
const authenticateUser = require("../../controller/authenticatUser");
const {
  urlGeneratorLimiter,
} = require("../../controller/rateLimiter/rateLimiter");

const router = Router();

// URL management endpoints
router.get("/", authenticateUser, require("../../controller/url/getUrl"));
router.post(
  "/",
  [authenticateUser, urlGeneratorLimiter],
  require("../../controller/url/generateUrl")
);
router.delete(
  "/:id",
  authenticateUser,
  require("../../controller/url/deleteUrl")
);
// router.get("/stats", authenticateUser, require("./stats"));
// router.get("/analytics", authenticateUser, require("./analytics"));

module.exports = router;
