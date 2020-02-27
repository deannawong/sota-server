const {
  Activity,
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
      firstName: "James",
      lastName: "Doe",
      city: "New York City",
      email: "jamesdoe@gmail.com",
      password: "secret"
    })
      .then(userJames => {
        const newDate = new Date();
        newDate.setHours(newDate.getHours() + 12);

        return Itinerary.create({
          name: "NYC",
          startLocationLat: 40.7046,
          startLocationLong: -74.0095,
          endLocationLat: 40.7046,
          endLocationLong: -74.0095,
          startTime: "10:00",
          endTime: "23:00",
          userId: userJames.id
        });
      })
      .then(jamesItinerary =>
        ActivityInstance.create({
          startTime: "10:00",
          endTime: "12:00",
          date: jamesItinerary.date,
          duration: 2.0,
          itineraryId: jamesItinerary.id
        })
      )
      .then(() => {
        return axios.get(
          "https://www.triposo.com/api/20190906/poi.json?location_id=New_York_City&count=100&fields=id,name,coordinates,tags",
          {
            headers: {
              "X-Triposo-Account": "TNLT0JW7",
              "X-Triposo-Token": "t0jw7n30yhgebkre1hisqd696bhfquhx"
            }
          }
        );
      })
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
              type: tags[0].tag.name
            });
          }
        });
        return processedResults;
      })
      .then(processedResults => Activity.bulkCreate(processedResults));
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
