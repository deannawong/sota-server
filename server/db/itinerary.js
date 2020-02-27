const Sequelize = require("sequelize");
const db = require("./database");

const { STRING, UUID, UUIDV4, DATE, NOW, GEOMETRY, TIME, FLOAT } = Sequelize;

const Itinerary = db.define("itinerary", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  name: {
    type: STRING,
    allowNull: false
  },
  date: {
    type: DATE,
    defaultValue: NOW,
    validate: {
      isDate: true
    }
  },
  startLocationLat: {
    type: FLOAT,
    allowNull: false
  },
  startLocationLong: {
    type: FLOAT,
    allowNull: false
  },
  endLocationLat: {
    type: FLOAT,
    allowNull: false
  },
  endLocationLong: {
    type: FLOAT,
    allowNull: false
  },
  startTime: {
    type: TIME,
    allowNull: false
  },
  endTime: {
    type: TIME,
    allowNull: false
  }
});

module.exports = Itinerary;
