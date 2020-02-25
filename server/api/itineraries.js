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

module.exports = router;
