const { sync, User, Session } = require('./db');
const express = require('express');
const path = require('path');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const volleyball = require('volleyball');
const moment = require('moment');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
} else {
  require('dotenv').load();
};

//initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// logging middleware
const debug = process.env.NODE_ENV === 'test';
app.use(volleyball.custom({ debug }));

//cookie parser
app.use(cookieParser());
// app.use(cors());

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.options('*', cors(corsOptions));

app.use(cors(corsOptions), (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    next();
    return;
  }
  if (token.startsWith('Bearer')) {
    token = token.slice(7, token.length);
  }
  User.findOne({
    where: {
      token,
    },
  })
    .then(userOrNull => {
      if (userOrNull) {
        req.user = userOrNull;
      }
      next();
    })
    .catch(e => {
      console.error('error finding requested user: ', e);
      next();
    });
});

//routes

app.use('/api', require('./api'));
app.use('/auth', require('./auth'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/index.html'));
});
const startServer = () =>
  new Promise((res, rej) => {
    app.listen(PORT, () => {
      console.log(chalk.cyan(`Application running on ${PORT}`));
      res();
    });
  });

sync(false).then(result => {
  if (result) {
    return startServer();
  }
  throw new Error('Failed to start server!');
});
