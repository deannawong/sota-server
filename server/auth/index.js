const router = require('express').Router();
const moment = require('moment');
const { User, Session } = require('../db/index');
const cors = require('cors');

// router.use((req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true');
// });

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
};

router.options('*', cors(corsOptions));

// router.use((req, res, next) => {
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, OPTIONS, PUT, PATCH, DELETE'
//   );
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   );
// });

router.post('/login', (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(userOrNull => {
      if (userOrNull && !userOrNull.isPasswordValid(req.body.password)) {
        console.error('invalid password');
        return res.sendStatus(400);
      }
      if (!userOrNull) return res.sendStatus(401);
      // console.log('cookies in log in post: ', req.cookies);
      // Session.create().then(newSession => {
      //   console.log('new session id created in post: ', newSession.id);
      //   res.cookie('sessionId', newSession.id, {
      //     path: '/',
      //     expires: moment
      //       .utc()
      //       .add(1, 'month')
      //       .toDate(),
      //   });
      //   User.update(
      //     {
      //       sessionId: newSession.id,
      //     },
      //     {
      //       where: {
      //         id: userOrNull.id,
      //       },
      //     }
      //   );
      //   res.status(200).send(userOrNull);
      // });
      User.update(
        {
          sessionId: req.cookies.sessionId,
        },
        {
          where: {
            id: userOrNull.id,
          },
        }
      );
      res.status(200).send(userOrNull);
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

router.get('/me', cors(corsOptions), (req, res, next) => {
  if (req.user) {
    return res.send(req.user);
  }
  res.status(401).send(null);
  console.log('no user found');
  next();
});

module.exports = router;
