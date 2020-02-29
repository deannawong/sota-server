const router = require("express").Router();
const { Activity } = require("../db");

router.get("/", (req, res, next) => {
  Activity.findAll()
    .then(allActivities => {
      if (allActivities.length) {
        res.status(200).send(allActivities);
      } else {
        res.status(404).send("No activities found!");
      }
    })
    .catch(err => next(err));
});

router.get("/:id", (req, res, next) => {
  const { id } = req.params;
  Activity.findByPk(id).then(foundActivity => {
    if (foundActivity) {
      res.status(200).send(foundActivity);
    } else {
      res.status(404).send(`No activity found with id ${id}`);
    }
  });
});

router.post("/", (req, res, next) => {
  Activity.create(req.body).then(newActivity =>
    res.status(201).send(newActivity)
  );
});

router.get("/:itineraryId", (req, res, next) => {
  const { itineraryId } = req.params
  Activity.findAll({ where: { itineraryId: itineraryId } })
})

module.exports = router;
