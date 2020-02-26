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
    return User.create({
      firstName: "James",
      lastName: "Doe",
      city: "New York City",
      email: "jamesdoe@gmail.com",
      password: "secret"
    })
      .then(() =>
        axios.get(
          "https://www.triposo.com/api/20190906/poi.json?location_id=New_York_City&count=100&fields=id,name,coordinates,tags",
          {
            headers: {
              "X-Triposo-Account": `${process.env.TRIPOSO_ACCOUNT}`,
              "X-Triposo-Token": `${process.env.TRIPOSO_TOKEN}`
            }
          }
        )
      )
      .then(triposoResponse => {
        const { result } = triposoResponse;
        return result.map(activity => {
          const { name, coordinates } = activity;
          return {
            name: name,
            location: {
              type: "Point",
              coordinates: [coordinates.latitude, coordinates.longitude]
            }
          };
        });
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
