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

const Scheduled = db.define('scheduled', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
  },
  order: {
    type: INTEGER,
    allowNull: false,
  },
  locationLong: {
    type: FLOAT,
  },
  locationLat: {
    type: FLOAT,
  },
  types: {
    type: ARRAY(STRING) || STRING,
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
  distanceToNext: {
    type: FLOAT,
  },
  scheduled: {
    type: BOOLEAN,
  },
  startTime: {
    type: STRING, // maybe string
  },
  endTime: {
    type: STRING, // maybe string
  },
  travel_time_minutes: {
    type: INTEGER,
  },
});

module.exports = Scheduled;
