const router = require('express').Router();
const moment = require('moment');
const { User, Session } = require('../db/index');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { checkToken } = require('../middleware');

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
  // credentials: true,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
};

router.options('*', cors(corsOptions));

router.post('/login', cors(corsOptions), (req, res, next) => {
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
      // might want to change expiration time
      let token = jwt.sign({ email: req.body.email }, process.env.JWT_TOKEN, {
        expiresIn: '1h',
      });
      User.update(
        {
          token,
        },
        {
          where: {
            id: userOrNull.id,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: 'Authentication successful!',
        token: token,
        user: userOrNull,
      });
    })
    .catch(e => {
      console.log('error signing in');
      console.error(e);
      next();
    });
});

router.post('/signup', (req, res, next) => {
  User.findOrCreate({
    where: req.body,
  })
    .then(userOrNull => {
      if (!userOrNull) return res.status(500).send('error creating user');

      let token = jwt.sign({ email: userOrNull.email }, process.env.JWT_TOKEN, {
        expiresIn: '1h',
      });
      // need to fix this so you can create an account and then be signed in
      console.log('token: ', token);
      User.update(
        {
          token,
        },
        {
          where: {
            id: userOrNull.id,
          },
        }
      );
      console.log('user after update: ', userOrNull);
      req.headers.authorization = token;
      req.user = userOrNull;
      res.send(userOrNull);
    })
    .catch(e => {
      console.log('error creating user');
      console.error(e);
      next();
    });
});

router.post('/logout', cors(corsOptions), (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then(userOrNull => {
      if (!userOrNull) {
        return res.sendStatus(401);
      }
      delete req.user;
      delete req.headers.authorization;
      User.update(
        {
          token: '',
        },
        {
          where: {
            id: userOrNull.id,
          },
        }
      );
      res.sendStatus(204);
      next();
    })
    .catch(e => {
      console.log('error signing out');
      console.error(e);
      next();
    });
});

router.get('/me', cors(corsOptions), (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    console.log('no token in get to auth/me');
    res.sendStatus(401);
    next();
  }
  if (req.user) {
    console.log('found user');
    return res.send(req.user);
  }
  res.sendStatus(401);
  console.log('no user found');
  next();
});

module.exports = router;
