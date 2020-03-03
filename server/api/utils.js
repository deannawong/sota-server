const axios = require('axios');

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

  console.log('****URLS*****', urls);

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
      console.log('********Triposo Response*******', triposoResponses);
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
      console.log('*******PROCESSED RESULTS********', processedResults);
      return processedResults;
    })
    .catch(err => {
      console.log('Issue with fetching from triposo');
      console.error(err);
      next(err);
    });
};

module.export = { fetchTriposoData };
