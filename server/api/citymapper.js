const router = require('express').Router();
const cors = require('cors');
const axios = require('axios');

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
  try {
    const {
      date,
      startTime,
      startLocationLat,
      startLocationLong,
      endLocationLat,
      endLocationLong,
    } = req.body.newItinerary;

    const { scheduledActivities } = req.body;
    const { locationLat, locationLong } = scheduledActivities[0];
    const dateToUse = date.split('T')[0];
    const firstDate = new Date(
      `${date.split('T')[0]} ${startTime}`
    ).toISOString();
    const dateToSend = firstDate.split(':').join('%3');

    const newActs = [];
    axios
      .get(
        `https://developer.citymapper.com/api/1/traveltime/?startcoord=${startLocationLat}%2C${startLocationLong}&endcoord=${locationLat}%2C${locationLong}&time=${dateToSend}&time_type=arrival&key=${process.env.CITY_MAPPER_API}`
      )
      .then(res => {
        const firstTransit = res.data;
        firstTransit.types = 'transit';
        newActs.push(firstTransit);
      })
      .then(() => {
        const actsToSend = scheduledActivities.reduce(
          async (acc, activity, idx) => {
            const { locationLat, locationLong, endTime } = activity;
            const firstDate = new Date(`${dateToUse} ${endTime}`).toISOString();
            const dateToSend = firstDate.split(':').join('%3');
            let nextLat;
            let nextLng;
            if (idx < scheduledActivities.length - 1) {
              const nextActivity = scheduledActivities[idx + 1];
              nextLat = nextActivity.locationLat;
              nextLng = nextActivity.locationLong;
            } else {
              nextLat = endLocationLat;
              nextLng = endLocationLong;
            }
            const transitObj = (
              await axios.get(
                `https://developer.citymapper.com/api/1/traveltime/?startcoord=${locationLat}%2C${locationLong}&endcoord=${nextLat}%2C${nextLng}&time=${dateToSend}&time_type=arrival&key=${process.env.CITY_MAPPER_API}`
              )
            ).data;

            // console.log('transit object: ', transitObj);

            // without time
            // const transitObj = (
            //   await axios.get(
            //     `https://developer.citymapper.com/api/1/traveltime/?startcoord=${locationLat}%2C${locationLong}&endcoord=${nextLat}%2C${nextLng}&time_type=arrival&key=${cityMapperAPIKey}`
            //   )
            // ).data;
            transitObj.types = 'transit';
            acc.push(activity);
            acc.push(transitObj);
            return acc;
          },
          newActs
        );
        console.log('acts to send: ', actsToSend);
        res.status(200).send(actsToSend);
      })
      .catch(e => {
        console.log('error getting from city mapper');
        console.error(e);
      });
  } catch (e) {
    console.log('error posting on city mapper route');
    console.error(e);
  }
});

module.exports = router;