const router = require('express').Router();
const { Itinerary, ActivityInstance } = require('../db');
const { fetchTriposoData, processActivityInstances } = require('./utils');

router.get('/', (req, res, next) => {
  Itinerary.findAll()
    .then(allItineraries => {
      if (allItineraries.length) {
        res.status(200).send(allItineraries);
      } else {
        res.status(404).send('No itineraries found!');
      }
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  Itinerary.findByPk(req.params.id)
    .then(itineraryOrNull => {
      console.log('itinerary or null: ', itineraryOrNull);
      if (!itineraryOrNull) return res.status(404).send('no itinerary found');
      res.status(200).send(itineraryOrNull);
    })
    .catch(err => {
      console.log('error finding specific itinerary');
      console.error(err);
      next(err);
    });
});

router.post('/', (req, res, next) => {
  Itinerary.create(req.body)
    .then(newItinerary => res.status(200).send(newItinerary))
    .catch(err => {
      console.err('Error with creating new itinerary.');
      next(err);
    });
});
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  Itinerary.findByPk(id)
    .then(foundOrNull => {
      if (!foundOrNull) {
        return res.status(401).send(`Intinerary not found`);
      } else {
        return foundOrNull.update(req.body);
      }
    })
    .then(updatedItinerary => res.status(201).send(updatedItinerary))
    .catch(err => {
      console.error('Could not update Itinerary.');
      next(err);
    });
});

router.post('/newActivities/:userId', (req, res, next) => {
  const { userId } = req.params;
  const {
    name,
    date,
    startLocation,
    endLocation,
    startTime,
    endTime,
    locationName,
    budget,
    tags,
  } = req.body;

  const [startLocationLat, startLocationLong] = startLocation.split(',');
  const [endLocationLat, endLocationLong] = endLocation.split(',');

  return Itinerary.create({
    name,
    date,
    startLocationLat,
    startLocationLong,
    endLocationLat,
    endLocationLong,
    startTime,
    endTime,
    userId,
  })
    .then(newItinerary => {
      const urlObj = {
        locationName,
        budget,
        startLocation,
        tags,
        itineraryId: newItinerary.id,
      };
      return fetchTriposoData(urlObj);
    })
    .then(triposoObjs => {
      const [scheduledActivities, otherOptions] = processActivityInstances(
        triposoObjs,
        startTime,
        endTime
      );

      return Promise.all([
        ActivityInstance.bulkCreate(scheduledActivities),
        ActivityInstance.bulkCreate(otherOptions),
      ]);
    })
    .then(newActivityInstances => {
      const [scheduledActivities, otherOptions] = newActivityInstances;

      Itinerary.findOne({
        where: {
          id: scheduledActivities[0].itineraryId,
        },
      }).then(itineraryOrNull => {
        res.status(200).json({
          newItinerary: itineraryOrNull,
          scheduledActivities,
          otherOptions,
        });
      });
    })
    .catch(err => {
      console.log('Error with creating activity instances with triposo');
      console.error(err);
      next(err);
    });
});

module.exports = router;
