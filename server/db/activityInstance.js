const Sequelize = require("sequelize");
const db = require("./database");

const {
  STRING,
  UUID,
  UUIDV4,
  DECIMAL,
  GEOMETRY,
  TIME,
  ENUM,
  DATE,
  FLOAT
} = Sequelize;

const ActivityInstance = db.define("activityInstance", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  name: {
    type: STRING,
    allowNull: false
  },
  locationLong: {
    type: FLOAT,
    allowNull: false
  },
  locationLat: {
    type: FLOAT,
    allowNull: false
  },
  type: {
    type: STRING
  },
  startTime: {
    type: TIME
  },
  endTime: {
    type: TIME
  },
  date: {
    type: DATE
  },
  duration: {
    type: DECIMAL(10, 2) // I think the best way to calculate duration is in quarter hours
  }
  // rating: {
  //   type: ENUM(1, 2, 3, 4, 5)
  // }
});

module.exports = ActivityInstance;
