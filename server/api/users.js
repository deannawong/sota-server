const router = require('express').Router();
const { User, Itinerary, ActivityInstance, Activity } = require('../db');
const axios = require('axios');

router.get('/', (req, res, next) => {
  axios
    .get(
      'https://developer.citymapper.com/api/1/traveltime/?startcoord=40.7050758%2C-74.0091604&endcoord=40.7191024%2C-73.9970647&time_type=arrival&key=0864acf38bb71298ce6ad39ae55351e7'
    )
    .then(res => console.log('city mapper response', res))
    .catch(e => {
      console.log('error getting from city mapper');
      console.error(e);
    });
  User.findAll({
    include: [
      {
        model: Itinerary,
        include: [{ model: ActivityInstance }],
      },
    ],
  })
    .then(allUsers => {
      if (allUsers.length) {
        res.status(200).send(allUsers);
      } else {
        res.status(404).send('No users found!');
      }
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  User.findOne({
    where: { id },
    include: [
      {
        model: Itinerary,
        include: [{ model: ActivityInstance }],
      },
    ],
  })
    .then(userOrNull => {
      if (userOrNull) {
        res.status(200).send(userOrNull);
      }
      res.status(404).send('User not found.');
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  User.create(req.body)
    .then(newUser => res.status(200).send(newUser))
    .catch(err => {
      console.err('Error with creating new user.');
      next(err);
    });
});

module.exports = router;
