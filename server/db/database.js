const Sequelize = require('sequelize');
const chalk = require('chalk');
const dbName = 'capstone_travel_app';
console.log(chalk.yellowBright(`opening database connection to ${dbName}`));

// const db = new Sequelize(
//   process.env.DATABASE_URL || `postgres://localhost:5432/${dbName}`,
//   {
//     logging: false,
//   }
// );
const DATABASE_URL = `postgres://localhost:5432/${dbName}`
let config;
if (process.env.DATABASE_URL) {
  config = {
    logging: false,
    operatorsAliases: false,
    dialect: 'postgres',
    protocol: 'postgres',
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  };
} else {
  config = {
    logging: false,
    operatorsAliases: 0,
  };
}

const db = new Sequelize(DATABASE_URL, config);

module.exports = db;
