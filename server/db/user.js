const Sequelize = require('sequelize');
const db = require('./database');
var bcrypt = require('bcrypt');

const { STRING, UUID, UUIDV4 } = Sequelize;

const User = db.define(
  'user',
  {
    id: {
      type: UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    City: {
      type: STRING,
      allowNull: true,
    },
    email: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    hooks: {
      beforeCreate: user => {
        const { password } = user;
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;
      },
    },
  }
);

User.prototype.isPasswordValid = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;
