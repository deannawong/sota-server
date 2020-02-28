const router = require('express').Router();
const { User, Session } = require('../db/index');

router.post('/login', (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(userOrNull => {
      if (userOrNull && !userOrNull.isPasswordValid(req.body.password)) {
        console.error('invalid password');
        res.sendStatus(400);
      }
      if (!userOrNull) return res.sendStatus(401);
      // console.log('cookies in log in post: ', req.cookies);
      Session.create().then(newSession => {
        res.cookie('sessionId', newSession.id, {
          path: '/',
          expires: moment
            .utc()
            .add(1, 'month')
            .toDate(),
        });
        User.update(
          {
            sessionId: newSession.id,
          },
          {
            where: {
              id: userOrNull.userId,
            },
          }
        );
        res.status(200).send(userOrNull);
      });
      // User.update(
      //   {
      //     sessionId: req.cookies.sessionId,
      //   },
      //   {
      //     where: {
      //       id: userOrNull.userId,
      //     },
      //   }
      // );
      // res.status(200).send(userOrNull);
    })
    .catch(e => {
      console.log('error signing in');
      console.error(e);
      next();
    });
});

router.post('/signup', (req, res, next) => {
  req.body.sessionId = req.cookies.sessionId;
  User.findOrCreate({
    where: req.body,
  })
    .then(userOrNull => {
      if (!userOrNull) return res.status(500).send('error creating user');
      req.user = userOrNull;
      res.send(user);
    })
    .catch(e => {
      console.log('error creating user');
      console.error(e);
      next();
    });
});

router.get('/signout', (req, res, next) => {
  res.clearCookie('sessionId');
  res.sendStatus(204);
  next();
});

router.get('/me', (req, res, next) => {
  if (req.user) {
    return res.send(req.user);
  }
  res.status(401).send(null);
  console.log('no user found');
  next();
});

module.exports = router;
