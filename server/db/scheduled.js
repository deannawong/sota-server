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
  order: {
    type: INTEGER,
    allowNull: false,
  },
  location: {
    type: STRING,
  },
  type: {
    type: STRING,
    allowNull: false,
  },
  duration: {
    type: FLOAT,
  },
  rating: {
    type: STRING,
  },
  url: {
    type: STRING,
  },
});

module.exports = Scheduled;
