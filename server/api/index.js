const router = require("express").Router();
router.use("/users", require("./users"));
router.use("/itineraries", require("./itineraries"));
router.use("/activityInstances", require("./activityInstances"));
router.use("/activities", require("./activities"));

router.use((req, res, next) => {
  const err = new Error("API route not found!");
  err.status = 404;
  next(err);
});

module.exports = router;
