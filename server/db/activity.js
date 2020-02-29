const Sequelize = require("sequelize");
const db = require("./database");

const { STRING, UUID, UUIDV4, ENUM, FLOAT } = Sequelize;
//THIS MODEL MAY NO LONGER BE NEEDED//
const Activity = db.define("activity", {
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
  averageRating: {
    type: ENUM("1", "2", "3", "4", "5")
  }
});

module.exports = Activity;
