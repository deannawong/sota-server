const router = require('express').Router();
const cors = require('cors');
const axios = require('axios');

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

router.post('/', async (req, res, next) => {
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
    const firstDate = new Date(
      `${date.split('T')[0]} ${startTime}`
    ).toISOString();
    const dateToSend = firstDate.split(':').join('%3');
    console.log({
      dateToSend,
      startLocationLat,
      startLocationLong,
      locationLat,
      locationLong,
    });

    const firstTransit = (
      await axios.get(
        `https://developer.citymapper.com/api/1/traveltime/?startcoord=${startLocationLat}%2C${startLocationLong}&endcoord=${locationLat}%2C${locationLong}&time=${dateToSend}&time_type=arrival&key=${cityMapperAPIKey}`
      )
    ).data;

    console.log('first transit: ', firstTransit);
    const actsToSend = [firstTransit];

    scheduledActivities.forEach(async (activity, idx) => {
      const { locationLat, locationLong, endTime } = activity;
      const dateOfTrip = date.split('T')[0];
      const firstDate = new Date(`${dateofTrip} ${endTime}`).toISOString();
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
          `https://developer.citymapper.com/api/1/traveltime/?startcoord=${locationLat}%2C${locationLong}&endcoord=${nextLat}%2C${nextLng}&time=${dateToSend}&time_type=arrival&key=${cityMapperAPIKey}`
        )
      ).data;

      // without time
      // const transitObj = (
      //   await axios.get(
      //     `https://developer.citymapper.com/api/1/traveltime/?startcoord=${locationLat}%2C${locationLong}&endcoord=${nextLat}%2C${nextLng}&time_type=arrival&key=${cityMapperAPIKey}`
      //   )
      // ).data;
      transitObj.types = 'transit';
      actsToSend.push(activity);
      actsToSend.push(transitObj);
    });

    res.status(200).send(actsToSend);
  } catch (e) {
    console.log('error posting on city mapper route');
    console.error(e);
  }
});

module.exports = router;
