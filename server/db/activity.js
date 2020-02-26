const Sequelize = require("sequelize");
const db = require("./database");

const { STRING, UUID, UUIDV4, DECIMAL, GEOMETRY, TIME, ENUM } = Sequelize;

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
  location: {
    type: GEOMETRY("POINT"),
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
