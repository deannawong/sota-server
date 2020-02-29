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

router.post("/newActivities/:itineraryId", (req, res, next) => {
  const { itineraryId } = req.params
  //Will need to edit the Axios URL once we have tags we want to use.
  //tags will need to be an array. 
  const { tags, city } = req.body
  axios.get(
    "https://www.triposo.com/api/20190906/poi.json?location_id=New_York_City&count=20&fields=id,name,coordinates,tags",
    {
      headers: {
        "X-Triposo-Account": "TNLT0JW7",
        "X-Triposo-Token": "t0jw7n30yhgebkre1hisqd696bhfquhx"
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
