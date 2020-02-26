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

const seed = () => {
  return sync(true).then(() => {
    User.create({
      firstName: "James",
      lastName: "Doe",
      city: "New York City",
      email: "jamesdoe@gmail.com",
      password: "secret"
    });
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
