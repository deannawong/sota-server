const router = require("express").Router();
const { ActivityInstance } = require("../db");
const { urlGenerator } = require("./utils")

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

router.post("/newActivities/:itineraryId", (req, res, next) => {
  const { itineraryId } = req.params
  // const { tags, location, budget, coordinates } = req.body
  //coordinates must be start location
  const triposoUrl = urlGenerator(req.body);
  axios.get(
    triposoUrl,
    // "https://www.triposo.com/api/20190906/poi.json?tag_labels=food|museums|poitype-Museum_district|subtype-Natural_history_museums&location_id=Boston&count=20&fields=name,tag_labels,coordinates&annotate=persona:budget",
    {
      headers: {
        "X-Triposo-Account": process.env.TRIPOSO_ACCOUNT,
        "X-Triposo-Token": process.env.TRIPOSO_TOKEN
      }
    }
  )
    .then(triposoResponse => {
      const { results } = triposoResponse.data;
      const processedResults = [];
      results.forEach(activity => {
        const { name, coordinates, tags } = activity;
        if (name && coordinates && tags) {
          processedResults.push({
            name: name,
            locationLat: coordinates.latitude,
            locationLong: coordinates.longitude,
            type: tags[0].tag.name,
            itineraryId: itineraryId
          });
        }
      });
      return processedResults;
    })
    .then(processedResults => ActivityInstance.bulkCreate(processedResults))
    .then(newActivityInstances => res.status(200).send(newActivityInstances))
    .catch(err => {
      console.error("Error with creating activity instances with triposo");
      next(err);
    })
})

module.exports = router;
