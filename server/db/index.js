const chalk = require("chalk");
const db = require("./database");
const User = require("./user");
const Activity = require("./activity");
const ActivityInstance = require("./activityInstance");
const Itinerary = require("./itinerary");

//For the geometry type to work, must run this command in CLI:
// psql capstone_travel_app -c "CREATE EXTENSION postgis"
Activity.belongsToMany(Itinerary, { through: ActivityInstance });
Itinerary.hasMany(Activity);

Itinerary.belongsTo(User);
User.hasMany(Itinerary);
// Activity.belongsToMany(User, { through: Itinerary });

const sync = (force = false) => {
  return db
    .sync({ force })
    .then(() => true)
    .catch(e => {
      console.log(chalk.red("Error while syncing database."));
      console.error(e);
    });
  return false;
};

module.exports = {
  sync,
  db,
  User,
  Activity,
  Itinerary,
  ActivityInstance
};
