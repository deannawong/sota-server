const axios = require('axios');
const turf = require('@turf/turf');
const moment = require('moment');

const fetchTriposoData = ({
  tags,
  locationName,
  budget,
  startLocation,
  itineraryId,
}) => {
  const count = Math.round(20 / tags.length);
  const urls = tags.map(tag => {
    const tagStr = `tag_labels=${tag}`;
    const locationStr = `location_id=${locationName}`;
    const countStr = `count=${count}`;
    const personaStr = `annotate=persona:${budget}`;
    const coordinateStr = `annotate=distance:${startLocation}`;

    return `https://www.triposo.com/api/20190906/poi.json?${tagStr}&${locationStr}&${countStr}&fields=images,name,coordinates,tag_labels&${coordinateStr}&${personaStr}`;
  });

  return Promise.all(
    urls.map(url => {
      return axios.get(url, {
        headers: {
          'X-Triposo-Account': process.env.TRIPOSO_ACCOUNT,
          'X-Triposo-Token': process.env.TRIPOSO_TOKEN,
        },
      });
    })
  )
    .then(triposoResponses => {
      const processedResults = [];

      triposoResponses.forEach(response => {
        const { results } = response.data;

        if (results.length) {
          results.forEach(activity => {
            const {
              images,
              name,
              coordinates,
              distance,
              tag_labels,
            } = activity;

            const imageUrls = images.length
              ? images.map(imageObj => imageObj.source_url)
              : [];

            processedResults.push({
              name: name,
              locationLat: coordinates.latitude,
              locationLong: coordinates.longitude,
              types: tag_labels,
              itineraryId: itineraryId,
              distance: distance,
              images: imageUrls,
              itineraryId,
            });
          });
        }
      });

      return processedResults;
    })
    .catch(err => {
      console.log('Issue with fetching from triposo');
      console.error(err);
    });
};

const compareByDistanceToNext = (a, b) => {
  if (a.distanceToNext > b.distanceToNext) {
    return 1;
  } else if (b.distanceToNext > a.distanceToNext) {
    return -1;
  } else {
    return 0;
  }
};
const compareByDistanceToHome = (a, b) => {
  if (a.distance > b.distance) {
    return 1;
  } else if (b.distance > a.distance) {
    return -1;
  } else {
    return 0;
  }
};
const assignDistanceTo = (startCoords, arrOfLocations) => {
  arrOfLocations.forEach(location => {
    const to = turf.point(startCoords);
    const from = turf.point([location.locationLat, location.locationLong]);
    location.distanceToNext = turf.distance(to, from, { units: 'meters' });
  });
  return arrOfLocations;
};
const activityTime = (locationObj, remainingTime) => {
  let travelTimeToNext = 0,
    travelTimeHome = 0;
  const { distanceToNext, distance } = locationObj;

  if (distanceToNext) {
    if (distanceToNext > 1000) {
      travelTimeToNext = distanceToNext / 25000;
    } else {
      travelTimeToNext = distanceToNext / 4000;
    }
  } else {
    if (distance > 1000) {
      travelTimeToNext = distance / 25000;
    } else {
      travelTimeToNext = distance / 4000;
    }
  }
  if (distance > 1000) {
    travelTimeHome = distance / 25000;
  } else {
    travelTimeHome = distance / 4000;
  }

  if (travelTimeHome + travelTimeToNext + 1 > remainingTime) {
    return null;
  } else {
    return travelTimeToNext;
  }
};

const processActivityInstances = (pendingActivities, startTime, endTime) => {
  const startHr = moment(startTime, 'HH:mm').get('hour');
  const endHr = moment(endTime, 'HH:mm').get('hour');

  let remainingTime = endHr - startHr;
  const scheduledActivities = [];
  let otherOptions = pendingActivities.sort(compareByDistanceToHome);

  while (remainingTime && otherOptions.length) {
    let closestActivity = otherOptions[0];
    let closestActivityTime = activityTime(otherOptions[0], remainingTime);

    if (closestActivityTime) {
      closestActivity.scheduled = true;
      closestActivity.startTime = moment(startTime, 'HH:mm')
        .add(closestActivityTime, 'hour')
        .format('HH:mm');

      closestActivity.endTime = moment(startTime, 'HH:mm')
        .add(closestActivityTime + 1, 'hour')
        .format('HH:mm');


      startTime = closestActivity.endTime;


      scheduledActivities.push(closestActivity);
      remainingTime -= closestActivityTime + 1;
    } else {
      return [scheduledActivities, otherOptions];

    }
    otherOptions = assignDistanceTo(
      [closestActivity.locationLat, closestActivity.locationLong],
      otherOptions.slice(1)
    );
    otherOptions.sort(compareByDistanceToNext);
  }

  return [scheduledActivities, otherOptions];
};

module.exports = { fetchTriposoData, processActivityInstances };
