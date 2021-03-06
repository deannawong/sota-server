const Sequelize = require('sequelize');
const db = require('./database');

const {
  STRING,
  UUID,
  UUIDV4,
  DECIMAL,
  GEOMETRY,
  TIME,
  ENUM,
  DATE,
  FLOAT,
  ARRAY,
  BOOLEAN,
  INTEGER,
} = Sequelize;

const ActivityInstance = db.define('activityInstance', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
  },
  locationLong: {
    type: FLOAT,
  },
  locationLat: {
    type: FLOAT,
  },
  types: {
    type: ARRAY(STRING),
  },
  startTime: {
    type: TIME,
  },
  endTime: {
    type: TIME,
  },
  date: {
    type: DATE,
  },
  images: {
    type: ARRAY(STRING),
  },
  distance: {
    type: FLOAT, // This is a distance value from the startCoords on the intinerary
  },
  duration: {
    type: DECIMAL(10, 2), // I think the best way to calculate duration is in quarter hours
  },
  distanceToNext: {
    type: FLOAT,
  },
  scheduled: {
    type: BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: INTEGER,
  },
  travel_time_minutes: {
    type: INTEGER,
  },
  // rating: {
  //   type: ENUM(1, 2, 3, 4, 5)
  // }
});

module.exports = ActivityInstance;
