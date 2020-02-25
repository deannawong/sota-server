const router = require("express").Router();
const { ActivityInstance } = require("../db");

router.get("/", (req, res, next) => {
  ActivityInstance.findAll()
    .then(allActivityInstances => {
      if (allActivityInstances.length) {
        res.status(200).send(allActivityInstances);
      } else {
        res.status(404).send("No activityInstances found!");
      }
    })
    .catch(err => next(err));
});

module.exports = router;
