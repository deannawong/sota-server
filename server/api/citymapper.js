const router = require('express').Router();
const cors = require('cors');
const axios = require('axios');
const { ActivityInstance } = require('../db');

const allowedOrigins = [
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:8100',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
};

router.options('*', cors(corsOptions));

router.get('/', (req, res, next) => {
  console.log('********hi, get  at api/citymapper worked*****');
});

router.post('/', (req, res, next) => {
  const {
    date,
    startLocationLat,
    startLocationLong,
    endLocationLat,
    endLocationLong,
    endTime,
    itineraryId,
  } = req.body;

  const dateToUse = date.split('T')[0];
  const firstDate = new Date(`${date.split('T')[0]} ${endTime}`).toISOString();
  const dateToSend = firstDate.split(':').join('%3');
  axios
    .get(
      `https://developer.citymapper.com/api/1/traveltime/?startcoord=${startLocationLat}%2C${startLocationLong}&endcoord=${endLocationLat}%2C${endLocationLong}&time=${dateToSend}&time_type=arrival&key=${process.env.CITY_MAPPER_API}`
    )
    .then(response => {
      const transitObj = response.data;
      transitObj.types = ['transit'];
      transitObj.scheduled = true;
      transitObj.itineraryId = itineraryId;
      ActivityInstance.create(transitObj)
        .then(newTransitObj => {
          res.status(200).send(newTransitObj);
        })
        .catch(err => {
          console.log('error creating new transit object');
          console.error(err);
        });
    })
    .catch(e => {
      console.log('error with city mapper');
      console.error(e);
    });
});

module.exports = router;
