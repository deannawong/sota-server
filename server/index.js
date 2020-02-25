const { sync } = require("./db");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
const volleyball = require("volleyball");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

//initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// logging middleware
const debug = process.env.NODE_ENV === "test";
app.use(volleyball.custom({ debug }));

//cookie parser
// app.use(cookieParser());
// app.use(cors());

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
// app.use(require("./api/cookies"));
app.use("/api", require("./api"));

const startServer = () =>
  new Promise((res, rej) => {
    app.listen(PORT, () => {
      console.log(chalk.cyan(`Application running on ${PORT}`));
      res();
    });
  });

sync(true).then(result => {
  if (result) {
    return startServer();
  }
  throw new Error("Failed to start server!");
});
