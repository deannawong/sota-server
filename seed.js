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
