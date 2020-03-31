const router = require('express').Router();
const { Scheduled } = require('../db');

router.get('/', (req, res, next) => {
  Scheduled.findAll()
    .then(allScheduled => {
      if (allScheduled.length) res.status(200).send(allScheduled);
      else res.status(404).send('no scheduled found');
    })
    .catch(err => {
      console.error('error getting all scheduled');
      next(err);
    });
});

router.get('/:itineraryId', (req, res, next) => {
  const { itineraryId } = req.params;
  Scheduled.findAll({
    where: {
      itineraryId,
    },
  })
    .then(scheduledForItin => {
      if (scheduledForItin.length) res.status(200).send(scheduledForItin);
      else res.status(404).send('no scheduled found for that itinerary');
    })
    .catch(err => {
      console.error('error getting scheduled for specific itinerary');
      next(err);
    });
});

router.post('/', (req, res, next) => {
  console.log('req body in scheduled post: ', req.body);
  const acts = req.body;
  const actsToReturn = [];
  for (let i = 0; i < acts.length; i++) {
    const act = acts[i];
    delete act.createdAt;
    delete act.updatedAt;
    act.order = i + 1;
    Scheduled.create(act)
      .then(created => {
        actsToReturn.push(created);
      })
      .catch(e => {
        console.log('error creating an act');
        console.error(e);
      });
  }
  if (actsToReturn.length) return res.status(200).send(actsToReturn);
  res.status(400).send('no scheduled created');
});

// router.post('/', (req, res, next) => {
//   console.log('req body in scheduled post: ', req.body);
//   Scheduled.bulkCreate(req.body)
//     .then(createdScheduled => {
//       console.log('created scheduled: ', createdScheduled);
//       if (createdScheduled.length) res.status(200).send(createdScheduled);
//       else {
//         res.status(404).send('no scheduled created');
//       }
//     })
//     .catch(err => {
//       console.error('error bulk creating scheduled');
//       next(err);
//     });
// });

module.exports = router;