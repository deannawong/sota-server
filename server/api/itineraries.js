const router = require("express").Router();
const { Itinerary } = require("../db");

router.get("/", (req, res, next) => {
  Itinerary.findAll()
    .then(allItineraries => {
      if (allItineraries.length) {
        res.status(200).send(allItineraries);
      } else {
        res.status(404).send("No itineraries found!");
      }
    })
    .catch(err => next(err));
});

router.post("/", (req, res, next) => {
  Itinerary.create(req.body)
    .then(newItinerary => res.status(200).send(newItinerary))
    .catch(err => {
      console.err("Error with creating new itinerary.");
      next(err);
    })
})
router.put("/:id", (req, res, next) => {
  const { id } = req.params;
  Itinerary.findByPk(id)
    .then(foundOrNull => {
      if (!foundOrNull) {
        return res.status(401).send(`Intinerary not found`);
      } else {
        return foundOrNull.update(req.body);
      }
    })
    .then(updatedItinerary =>
      res.status(201).send(updatedItinerary)
    )
    .catch(err => {
      console.error("Could not update Itinerary.");
      next(err);
    });
});

module.exports = router;
