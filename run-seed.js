const seed = require("./seed.js");
const { db } = require("./server/db");
const chalk = require("chalk");

seed()
  .then(() => {
    console.log(chalk.green("Seed script ran successfully"));
    process.exit(0);
  })
  .catch(e => {
    console.log(chalk.red("Seed script failed to run"));
    console.error(e);
    process.exit(1);
  });
