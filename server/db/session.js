const Sequelize = require('sequelize');
const db = require('./database');

const { UUID, UUIDV4 } = Sequelize;

const Session = db.define('session', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
});

module.exports = Session;
