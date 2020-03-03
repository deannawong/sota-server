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
    .catch(err => {
      console.error("Error getting all activity instances");
      next(err)
    });
});

router.post("/", (req, res, next) => {
  ActivityInstance.create(req.body)
    .then(newActivity => res.status(200).send(newActivity))
    .catch(err => {
      console.error("Unable to post new activity instance.");
      next(err);
    });
});

router.put("/:id", (req, res, next) => {
  const { id } = req.params;
  ActivityInstance.findByPk(id)
    .then(foundOrNull => {
      if (!foundOrNull) {
        return res.status(401).send(`Activity Instance not found`);
      } else {
        return foundOrNull.update(req.body);
      }
    })
    .then(updatedActivityInstance =>
      res.status(201).send(updatedActivityInstance)
    )
    .catch(err => {
      console.error("Could not update Activity Instance.");
      next(err);
    });
});



module.exports = router;
