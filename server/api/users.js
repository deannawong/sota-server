const router = require("express").Router();
const { User } = require("../db");

router.get("/", (req, res, next) => {
  User.findAll()
    .then(allUsers => {
      if (allUsers.length) {
        res.status(200).send(allUsers);
      } else {
        res.status(404).send("No users found!");
      }
    })
    .catch(err => next(err));
});

module.exports = router;
