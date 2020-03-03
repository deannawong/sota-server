const {
  ActivityInstance,
  Itinerary,
  User,
  db,
  sync
} = require("./server/db");
const axios = require("axios");
const chalk = require("chalk");
const moment = require("moment");

const seed = () => {
  return sync(true).then(() => {
    return User.create({
      firstName: "Patrick",
      lastName: "Doe",
      city: "Istanbul",
      email: "patrickdoe@gmail.com",
      password: "secret2"
    }).then(() => {
      return User.create({
        firstName: "James",
        lastName: "Doe",
        city: "New York City",
        email: "jamesdoe@gmail.com",
        password: "secret"
      })
    })
      .then(userJames => Itinerary.create({
        name: "NYC",
        startLocationLat: 40.7046,
        startLocationLong: -74.0095,
        endLocationLat: 40.7046,
        endLocationLong: -74.0095,
        startTime: "10:00",
        endTime: "23:00",
        userId: userJames.id
      })
      )
      .then(jamesItinerary => {
        return axios.get(
          "https://www.triposo.com/api/20190906/poi.json?tag_labels=eatingout&location_id=New_York_City&count=20&fields=name,coordinates,images,tag_labels&annotate=distance:40.7046,-74.0095&annotate=persona:mid_range",
          {
            headers: {
              "X-Triposo-Account": process.env.TRIPOSO_ACCOUNT,
              "X-Triposo-Token": process.env.TRIPOSO_TOKEN
            }
          }
        ).then(triposoResponse => {
          const { results } = triposoResponse.data;
          if (results.length) {
            return results.map(activity => {
              const { images, name, coordinates, distance, tag_labels } = activity;

              const imageUrls = images.length ? images.map(imageObj => imageObj.source_url) : [];

              return {
                name: name,
                locationLat: coordinates.latitude,
                locationLong: coordinates.longitude,
                types: tag_labels,
                itineraryId: itineraryId,
                distance: distance,
                images: imageUrls,
                itineraryId: jamesItinerary.id
              }
            })
          }

        }).then((processedResults => ActivityInstance.bulkCreate(processedResults)))
      })
  });
};
module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => {
      console.log(chalk.greenBright("Successful seeding in SOTA server."));
      db.close();
    })
    .catch(err => {
      console.error(chalk.redBright("Error with seeding SOTA server!"));
      console.error(err);
      db.close();
    });
}
