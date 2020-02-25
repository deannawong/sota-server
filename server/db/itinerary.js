const Sequelize = require('sequelize');
const db = require('./database');

const { STRING, UUID, UUIDV4, DATE, NOW, GEOMETRY, TIME } = Sequelize;

const Itinerary = db.define('itinerary', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  date: {
    type: DATE,
    defaultValue: NOW,
    validate: {
      isDate: true,
    },
  },
  startLocation: {
    type: GEOMETRY('POINT'),
    allowNull: false,
  },
  endLocation: {
    type: GEOMETRY('POINT'),
    allowNull: false,
  },
  startTime: {
    type: TIME,
    allowNull: false,
  },
  endTime: {
    type: TIME,
    allowNull: false,
  },
});

module.exports = Itinerary;
