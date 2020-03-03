const router = require("express").Router();
const { Itinerary, ActivityInstance } = require("../db");
const { fetchTriposoData } = require("./utils")


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

router.post("/newActivities/:userId", (req, res, next) => {
  const { userId } = req.params
  const { name, date, startCoords, endCoords, startTime, endTime, locationName, budget, tags } = req.body

  const [startLocationLat, startLocationLong] = startCoords.split(",");
  const [endLocationLat, endLocationLong] = endCoords.split(",");

  return Itinerary.create({ name, date, startLocationLat, startLocationLong, endLocationLat, endLocationLong, startTime, endTime, userId })
    .then(newItinerary => {
      const urlObj = { locationName, budget, startCoords, tags, itineraryId: newItinerary.id };
      return fetchTriposoData(urlObj);
    }).then(processedResults => ActivityInstance.bulkCreate(processedResults))
    .then(newActivityInstances => res.status(200).send(newActivityInstances))
    .catch(err => {
      console.error("Error with creating activity instances with triposo");
      next(err);
    })
})

module.exports = router;
