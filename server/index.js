const { sync, User, Session } = require('./db');
const express = require('express');
const path = require('path');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const volleyball = require('volleyball');
const moment = require('moment');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

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

// the below is how we make security work from one server to another client
// need to try both (and maybe more of the options)
// app.use((req, res, next) => {
//   // will need to to change localhost to our actual deployed front end app
//   res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );

//   next();
// });

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use((req, res, next) => {
  if (req.cookies.sessionId) {
    User.findOne({
      where: {
        sessionId: req.cookies.sessionId,
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
  } else {
    Session.create()
      .then(newSession => {
        res.cookie('sessionId', newSession.id, {
          path: '/',
          expires: moment
            .utc()
            .add(1, 'month')
            .toDate(),
        });
      })
      .catch(e => {
        console.log('error creating session');
        console.error(e);
      });
  }
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
