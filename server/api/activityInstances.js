const router = require('express').Router();
const { ActivityInstance } = require('../db');

router.get('/', (req, res, next) => {
  ActivityInstance.findAll()
    .then(allActivityInstances => {
      if (allActivityInstances.length) {
        res.status(200).send(allActivityInstances);
      } else {
        res.status(404).send('No activityInstances found!');
      }
    })
    .catch(err => {
      console.error('Error getting all activity instances');
      next(err);
    });
});

router.post('/', (req, res, next) => {
  ActivityInstance.create(req.body)
    .then(newActivity => res.status(200).send(newActivity))
    .catch(err => {
      console.error('Unable to post new activity instance.');
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  ActivityInstance.findByPk(id)
    .then(foundOrNull => {
      if (!foundOrNull) {
        return res.status(401).send(`Activity Instance not found`);
      } else {
        return foundOrNull.update(req.body);
      }
    })
    .then(updatedActivityInstance =>
      res.status(201).send(updatedActivityInstance)
    )
    .catch(err => {
      console.error('Could not update Activity Instance.');
      next(err);
    });
});

router.put('/', (req, res, next) => {
  const scheduledActs = req.body;
  scheduledActs.forEach(async act => {
    const { id } = act;
    await ActivityInstance.findByPk(id).then(foundOrNull => {
      if (!foundOrNull) continue;
      foundOrNull.update({
        scheduled: true,
      });
    });
  });
  console.log('scheduled acts after forEach: ', scheduledActs);
  return res.status(200).send(scheduledActs);
});

module.exports = router;
