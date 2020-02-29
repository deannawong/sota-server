const chalk = require('chalk');
const db = require('./database');
const User = require('./user');
const Activity = require('./activity');
const ActivityInstance = require('./activityInstance');
const Itinerary = require('./itinerary');
const Session = require('./session');

ActivityInstance.belongsTo(Itinerary);
Itinerary.hasMany(ActivityInstance);

Itinerary.belongsTo(User);
User.hasMany(Itinerary);
// Activity.belongsToMany(User, { through: Itinerary });

// Session.belongsTo(User);
// User.hasOne(Session);

User.belongsTo(Session);
Session.hasOne(User);

const sync = (force = false) => {
  return db
    .sync({ force })
    .then(() => true)
    .catch(e => {
      console.log(chalk.red('Error while syncing database.'));
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
  ActivityInstance,
  Session,
};
